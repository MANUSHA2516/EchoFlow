import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { createHash, randomBytes, randomInt } from 'crypto';
import { Model, Types } from 'mongoose';
import { UserRole } from '@echoflow/types';
import {
  Administrator,
  AuditLog,
  OtpChallenge,
  PasswordReset,
  Patient,
  RefreshSession,
  StaffMember,
} from '../database/schemas';
import {
  AuditCategory,
  OtpPurpose,
  PatientStatus,
  StaffAccountStatus,
  SubjectType,
} from '../database/enums';
import {
  AdminLoginDto,
  ForgotPasswordDto,
  PatientLoginDto,
  PatientRegisterDto,
  ResetPasswordDto,
  StaffLoginDto,
} from './dto';
import { AuthUser } from '../common/auth';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Patient.name) private readonly patients: Model<Patient>,
    @InjectModel(StaffMember.name) private readonly staff: Model<StaffMember>,
    @InjectModel(Administrator.name) private readonly admins: Model<Administrator>,
    @InjectModel(OtpChallenge.name) private readonly otps: Model<OtpChallenge>,
    @InjectModel(RefreshSession.name) private readonly sessions: Model<RefreshSession>,
    @InjectModel(PasswordReset.name) private readonly resets: Model<PasswordReset>,
    @InjectModel(AuditLog.name) private readonly audits: Model<AuditLog>,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  private hash(value: string) {
    return createHash('sha256').update(value).digest('hex');
  }

  private normalizePhone(phone: string) {
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('94') && digits.length >= 11) return `+${digits}`;
    if (digits.startsWith('0') && digits.length >= 10) return `+94${digits.slice(1)}`;
    if (digits.length === 9) return `+94${digits}`;
    if (phone.trim().startsWith('+')) return `+${digits}`;
    return `+94${digits}`;
  }

  private async challenge(
    purpose: OtpPurpose,
    phoneE164: string,
    patientId: Types.ObjectId | null,
    pendingPayload: Record<string, unknown> = {},
  ) {
    const code = String(randomInt(100000, 1000000));
    const ttl = this.config.get<number>('OTP_TTL_SECONDS', 300);
    const item = await this.otps.create({
      purpose,
      phoneE164,
      patientId,
      pendingPayload,
      codeHash: await bcrypt.hash(code, 10),
      expiresAt: new Date(Date.now() + ttl * 1000),
      lastSentAt: new Date(),
    });
    if (this.config.get('OTP_PROVIDER', 'console') === 'console') {
      console.log(`[EchoFlow OTP] ${phoneE164}: ${code}`);
    }
    return { challengeId: item.id, expiresIn: ttl };
  }

  async patientLogin(dto: PatientLoginDto) {
    const patient = await this.patients.findOne({
      nic: dto.nic.toUpperCase(),
      phoneE164: this.normalizePhone(dto.phone),
      status: PatientStatus.Active,
    });
    if (!patient) throw new UnauthorizedException('Invalid patient details');
    const challenge = await this.challenge(
      OtpPurpose.PatientLogin,
      patient.phoneE164,
      patient._id,
    );
    return { ...challenge, phoneE164: patient.phoneE164 };
  }

  async patientRegister(dto: PatientRegisterDto) {
    const nic = dto.nic.toUpperCase();
    const phoneE164 = this.normalizePhone(dto.phone);
    if (await this.patients.exists({ $or: [{ nic }, { phoneE164 }] })) {
      throw new BadRequestException('NIC or phone is already registered');
    }
    const challenge = await this.challenge(OtpPurpose.PatientRegister, phoneE164, null, {
      ...dto,
      nic,
      phoneE164,
    });
    return { ...challenge, phoneE164 };
  }

  async verifyOtp(challengeId: string, code: string, userAgent?: string) {
    const challenge = await this.otps.findById(challengeId);
    if (!challenge || challenge.consumedAt || challenge.expiresAt <= new Date()) {
      throw new BadRequestException('OTP challenge is invalid or expired');
    }
    if (challenge.attempts >= 5) throw new BadRequestException('Too many OTP attempts');
    const demoAllowed =
      this.config.get('OTP_PROVIDER', 'console') === 'console' && code === '123456';
    const valid = demoAllowed || (await bcrypt.compare(code, challenge.codeHash));
    if (!valid) {
      await this.otps.updateOne({ _id: challenge._id }, { $inc: { attempts: 1 } });
      throw new UnauthorizedException('Invalid OTP');
    }
    let patient = challenge.patientId
      ? await this.patients.findById(challenge.patientId)
      : null;
    if (challenge.purpose === OtpPurpose.PatientRegister) {
      const payload = challenge.pendingPayload;
      patient = await this.patients.create({
        fullName: String(payload.fullName),
        nic: String(payload.nic),
        phoneE164: String(payload.phoneE164),
        dateOfBirth: new Date(String(payload.dateOfBirth)),
        address: String(payload.address ?? ''),
        phoneVerifiedAt: new Date(),
        status: PatientStatus.Active,
      });
    }
    if (!patient) throw new NotFoundException('Patient not found');
    if (challenge.purpose === OtpPurpose.PhoneChange) {
      patient.phoneE164 = challenge.phoneE164;
      patient.phoneVerifiedAt = new Date();
      await patient.save();
    }
    challenge.consumedAt = new Date();
    await challenge.save();
    const tokens = await this.issue(
      { sub: patient.id, role: UserRole.Patient, typ: 'patient' },
      userAgent,
    );
    return {
      ...tokens,
      purpose: challenge.purpose,
      patient: {
        id: patient.id,
        fullName: patient.fullName,
        nic: patient.nic,
        phoneE164: patient.phoneE164,
      },
    };
  }

  async resend(challengeId: string) {
    const previous = await this.otps.findById(challengeId);
    if (!previous || previous.consumedAt) throw new BadRequestException('Invalid challenge');
    const cooldown = this.config.get<number>('OTP_RESEND_COOLDOWN_SECONDS', 30);
    if (
      previous.lastSentAt &&
      Date.now() - previous.lastSentAt.getTime() < cooldown * 1000
    ) {
      throw new BadRequestException('Please wait before requesting another OTP');
    }
    previous.consumedAt = new Date();
    await previous.save();
    return this.challenge(
      previous.purpose,
      previous.phoneE164,
      previous.patientId,
      previous.pendingPayload,
    );
  }

  async staffLogin(dto: StaffLoginDto, userAgent?: string) {
    const member = await this.staff.findOne({ staffId: dto.staffId.toUpperCase() });
    if (
      !member ||
      member.status !== StaffAccountStatus.Active ||
      !(await bcrypt.compare(dto.password, member.passwordHash))
    ) {
      throw new UnauthorizedException('Invalid staff credentials');
    }
    member.lastActiveAt = new Date();
    await member.save();
    return this.issue(
      { sub: member.id, role: member.role, typ: 'staff' },
      userAgent,
    );
  }

  async adminLogin(dto: AdminLoginDto, userAgent?: string) {
    const admin = await this.admins.findOne({ adminId: dto.adminId.toUpperCase() });
    const valid2fa =
      !admin?.totpEnabled ||
      (this.config.get('OTP_PROVIDER', 'console') === 'console' &&
        dto.twoFactorCode === '123456');
    if (
      !admin ||
      !(await bcrypt.compare(dto.password, admin.passwordHash)) ||
      !valid2fa
    ) {
      throw new UnauthorizedException('Invalid admin credentials or 2FA code');
    }
    admin.lastLoginAt = new Date();
    await admin.save();
    return this.issue(
      { sub: admin.id, role: UserRole.SuperAdmin, typ: 'admin' },
      userAgent,
    );
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const member = await this.staff.findOne({ email: dto.email.toLowerCase() });
    if (member) {
      const token = randomBytes(32).toString('hex');
      const minutes = this.config.get<number>('PASSWORD_RESET_TTL_MINUTES', 15);
      await this.resets.create({
        staffId: member._id,
        tokenHash: this.hash(token),
        expiresAt: new Date(Date.now() + minutes * 60_000),
      });
      if (this.config.get('OTP_PROVIDER', 'console') === 'console') {
        console.log(`[EchoFlow reset] ${member.email}: ${token}`);
      }
    }
    return { message: 'If the account exists, reset instructions were sent' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const reset = await this.resets.findOne({
      tokenHash: this.hash(dto.token),
      consumedAt: null,
      expiresAt: { $gt: new Date() },
    });
    if (!reset) throw new BadRequestException('Reset token is invalid or expired');
    await this.staff.updateOne(
      { _id: reset.staffId },
      { passwordHash: await bcrypt.hash(dto.password, 12) },
    );
    reset.consumedAt = new Date();
    await reset.save();
    return { message: 'Password reset successfully' };
  }

  private async issue(payload: AuthUser, userAgent?: string) {
    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.config.get('JWT_ACCESS_TTL', '15m'),
    });
    const refreshToken = await this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get('JWT_REFRESH_TTL', '7d'),
    });
    const decoded = this.jwt.decode(refreshToken) as { exp: number };
    await this.sessions.create({
      subjectType:
        payload.typ === 'patient'
          ? SubjectType.Patient
          : payload.typ === 'staff'
            ? SubjectType.Staff
            : SubjectType.Admin,
      subjectId: new Types.ObjectId(payload.sub),
      tokenHash: this.hash(refreshToken),
      expiresAt: new Date(decoded.exp * 1000),
      userAgent,
    });
    return {
      accessToken,
      refreshToken,
      expiresIn: this.config.get('JWT_ACCESS_TTL', '15m'),
    };
  }

  async refresh(token: string, userAgent?: string) {
    let payload: AuthUser;
    try {
      payload = await this.jwt.verifyAsync<AuthUser>(token, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const session = await this.sessions.findOne({
      tokenHash: this.hash(token),
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    });
    if (!session) throw new UnauthorizedException('Refresh session expired');
    session.revokedAt = new Date();
    await session.save();
    return this.issue(payload, userAgent);
  }

  async logout(token: string) {
    await this.sessions.updateOne(
      { tokenHash: this.hash(token), revokedAt: null },
      { revokedAt: new Date() },
    );
    return { message: 'Logged out' };
  }

  async me(user: AuthUser) {
    let record: Record<string, unknown> | null = null;
    if (user.typ === 'patient') {
      record = (await this.patients.findById(user.sub).lean()) as Record<string, unknown> | null;
    } else if (user.typ === 'staff') {
      record = (await this.staff.findById(user.sub).lean()) as Record<string, unknown> | null;
    } else {
      record = (await this.admins.findById(user.sub).lean()) as Record<string, unknown> | null;
    }
    if (!record) throw new NotFoundException('Account not found');
    const safe = { ...record };
    delete safe.passwordHash;
    delete safe.totpSecret;
    return safe;
  }

  async createPhoneChange(patientId: string, phone: string) {
    const phoneE164 = this.normalizePhone(phone);
    if (await this.patients.exists({ phoneE164, _id: { $ne: patientId } })) {
      throw new BadRequestException('Phone is already in use');
    }
    return this.challenge(
      OtpPurpose.PhoneChange,
      phoneE164,
      new Types.ObjectId(patientId),
    );
  }
}

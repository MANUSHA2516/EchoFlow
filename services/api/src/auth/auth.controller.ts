import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  NotImplementedException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  AdminLoginDto,
  ForgotPasswordDto,
  LogoutDto,
  OtpResendDto,
  OtpVerifyDto,
  PatientLoginDto,
  PatientRegisterDto,
  RefreshDto,
  ResetPasswordDto,
  StaffLoginDto,
} from './dto';
import { AuthUser, CurrentUser, JwtAuthGuard } from '../common/auth';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('patient/register')
  register(@Body() dto: PatientRegisterDto) {
    return this.auth.patientRegister(dto);
  }
  @Post('patient/login')
  patientLogin(@Body() dto: PatientLoginDto) {
    return this.auth.patientLogin(dto);
  }
  @Post('otp/verify')
  verify(@Body() dto: OtpVerifyDto, @Headers('user-agent') agent?: string) {
    return this.auth.verifyOtp(dto.challengeId, dto.code, agent);
  }
  @Post('otp/resend')
  resend(@Body() dto: OtpResendDto) {
    return this.auth.resend(dto.challengeId);
  }
  @Post('staff/login')
  @HttpCode(HttpStatus.OK)
  staffLogin(@Body() dto: StaffLoginDto, @Headers('user-agent') agent?: string) {
    return this.auth.staffLogin(dto, agent);
  }
  @Post('staff/forgot-password')
  forgot(@Body() dto: ForgotPasswordDto) {
    return this.auth.forgotPassword(dto);
  }
  @Post('staff/reset-password')
  reset(@Body() dto: ResetPasswordDto) {
    return this.auth.resetPassword(dto);
  }
  @Post('admin/login')
  @HttpCode(HttpStatus.OK)
  adminLogin(@Body() dto: AdminLoginDto, @Headers('user-agent') agent?: string) {
    return this.auth.adminLogin(dto, agent);
  }
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() dto: RefreshDto, @Headers('user-agent') agent?: string) {
    return this.auth.refresh(dto.refreshToken, agent);
  }
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Body() dto: LogoutDto) {
    return this.auth.logout(dto.refreshToken);
  }
  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthUser) {
    return this.auth.me(user);
  }
  @Post('sso/hospital')
  sso() {
    throw new NotImplementedException('Hospital SSO is not configured');
  }
}

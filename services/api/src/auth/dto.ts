import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MinLength,
} from 'class-validator';

export class PatientRegisterDto {
  @IsString() @IsNotEmpty() fullName!: string;
  @IsString() @Length(10, 14) nic!: string;
  @IsString() @IsNotEmpty() phone!: string;
  @IsDateString() dateOfBirth!: string;
  @IsOptional() @IsString() address?: string;
}
export class PatientLoginDto {
  @IsString() @IsNotEmpty() nic!: string;
  @IsString() @IsNotEmpty() phone!: string;
}
export class OtpVerifyDto {
  @IsString() challengeId!: string;
  @IsString() @Length(6, 6) code!: string;
}
export class OtpResendDto {
  @IsString() challengeId!: string;
}
export class StaffLoginDto {
  @IsString() staffId!: string;
  @IsString() password!: string;
}
export class ForgotPasswordDto {
  @IsEmail() email!: string;
}
export class ResetPasswordDto {
  @IsString() token!: string;
  @IsString() @MinLength(8) password!: string;
}
export class AdminLoginDto {
  @IsString() adminId!: string;
  @IsString() password!: string;
  @IsString() @Length(6, 6) twoFactorCode!: string;
}
export class RefreshDto {
  @IsString() refreshToken!: string;
}
export class LogoutDto {
  @IsString() refreshToken!: string;
}

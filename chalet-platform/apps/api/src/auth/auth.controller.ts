import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterSchema } from './dto/register.dto';
import { LoginSchema } from './dto/login.dto';
import { VerifyEmailSchema, ResendOtpSchema, ForgotPasswordSchema, ResetPasswordSchema } from './dto/verify.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() body: unknown) {
    const dto = RegisterSchema.parse(body);
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() body: unknown) {
    const dto = LoginSchema.parse(body);
    return this.authService.login(dto);
  }

  @Post('verify-email')
  verifyEmail(@Body() body: unknown) {
    const dto = VerifyEmailSchema.parse(body);
    return this.authService.verifyEmail(dto.email, dto.code);
  }

  @Post('resend-otp')
  resendOtp(@Body() body: unknown) {
    const dto = ResendOtpSchema.parse(body);
    return this.authService.resendOtp(dto.email, dto.purpose);
  }

  @Post('forgot-password')
  forgotPassword(@Body() body: unknown) {
    const dto = ForgotPasswordSchema.parse(body);
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  resetPassword(@Body() body: unknown) {
    const dto = ResetPasswordSchema.parse(body);
    return this.authService.resetPassword(dto.email, dto.code, dto.newPassword);
  }

  @Post('refresh')
  refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refresh(refreshToken);
  }
}

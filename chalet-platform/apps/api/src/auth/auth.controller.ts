import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterSchema } from './dto/register.dto';
import { LoginSchema } from './dto/login.dto';
import { VerifyEmailSchema, ResendOtpSchema, ForgotPasswordSchema, ResetPasswordSchema } from './dto/verify.dto';

const AUTH_THROTTLE = { default: { limit: 5, ttl: 60000 } };

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Throttle(AUTH_THROTTLE)
  @Post('register')
  register(@Body() body: unknown) {
    const dto = RegisterSchema.parse(body);
    return this.authService.register(dto);
  }

  @Throttle(AUTH_THROTTLE)
  @Post('login')
  login(@Body() body: unknown) {
    const dto = LoginSchema.parse(body);
    return this.authService.login(dto);
  }

  @Throttle(AUTH_THROTTLE)
  @Post('verify-email')
  verifyEmail(@Body() body: unknown) {
    const dto = VerifyEmailSchema.parse(body);
    return this.authService.verifyEmail(dto.email, dto.code);
  }

  @Throttle(AUTH_THROTTLE)
  @Post('resend-otp')
  resendOtp(@Body() body: unknown) {
    const dto = ResendOtpSchema.parse(body);
    return this.authService.resendOtp(dto.email, dto.purpose);
  }

  @Throttle(AUTH_THROTTLE)
  @Post('forgot-password')
  forgotPassword(@Body() body: unknown) {
    const dto = ForgotPasswordSchema.parse(body);
    return this.authService.forgotPassword(dto.email);
  }

  @Throttle(AUTH_THROTTLE)
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

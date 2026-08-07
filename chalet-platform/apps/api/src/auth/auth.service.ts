import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from './mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private mail: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const code = generateOtp();

    await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        fullName: dto.fullName,
        phone: dto.phone,
        emailVerified: false,
        otpCode: code,
        otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
        otpPurpose: 'verify',
      },
    });

    await this.mail.sendOtpEmail(dto.email, code, 'verify');
    return { message: 'Verification code sent to your email.', email: dto.email };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    if (!user.emailVerified) {
      throw new UnauthorizedException('Please verify your email before logging in.');
    }

    return this.signTokens(user.id, user.email, user.role);
  }

  async verifyEmail(email: string, code: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new BadRequestException('Invalid code.');
    if (user.emailVerified) throw new BadRequestException('Email already verified.');
    if (!user.otpCode || user.otpPurpose !== 'verify' || user.otpCode !== code) {
      throw new BadRequestException('Invalid code.');
    }
    if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      throw new BadRequestException('Code expired. Please request a new one.');
    }

    await this.prisma.user.update({
      where: { email },
      data: { emailVerified: true, otpCode: null, otpExpiresAt: null, otpPurpose: null },
    });

    return this.signTokens(user.id, user.email, user.role);
  }

  async resendOtp(email: string, purpose: 'verify' | 'reset') {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return { message: 'If an account exists, a code has been sent.' };
    if (purpose === 'verify' && user.emailVerified) {
      return { message: 'Email already verified.' };
    }

    const code = generateOtp();
    await this.prisma.user.update({
      where: { email },
      data: { otpCode: code, otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000), otpPurpose: purpose },
    });
    await this.mail.sendOtpEmail(email, code, purpose);
    return { message: 'Code sent.' };
  }

  forgotPassword(email: string) {
    return this.resendOtp(email, 'reset');
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new BadRequestException('Invalid code.');
    if (!user.otpCode || user.otpPurpose !== 'reset' || user.otpCode !== code) {
      throw new BadRequestException('Invalid code.');
    }
    if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      throw new BadRequestException('Code expired. Please request a new one.');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { email },
      data: { passwordHash, otpCode: null, otpExpiresAt: null, otpPurpose: null },
    });

    return { message: 'Password updated. You can now log in.' };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwt.verify(refreshToken, { secret: process.env.JWT_REFRESH_SECRET });
      return this.signTokens(payload.sub, payload.email, payload.role);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  private signTokens(sub: string, email: string, role: string) {
    const payload = { sub, email, role };
    return {
      accessToken: this.jwt.sign(payload, { secret: process.env.JWT_SECRET, expiresIn: '15m' }),
      refreshToken: this.jwt.sign(payload, { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d' }),
    };
  }
}

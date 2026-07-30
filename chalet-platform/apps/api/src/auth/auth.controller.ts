import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterSchema } from './dto/register.dto';
import { LoginSchema } from './dto/login.dto';

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
}

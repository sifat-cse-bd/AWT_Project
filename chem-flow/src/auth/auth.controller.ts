import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dtos/login.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() dto:LoginDto):Promise<any>{
    return this.authService.login(dto.email, dto.password);
  }
}

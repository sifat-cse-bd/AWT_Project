import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dtos/login.dto.js';
import { ApiTags } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @ApiTags('login')
  @Post('login')
  async login(@Body() dto:LoginDto):Promise<any>{
    return this.authService.login(dto.userId, dto.password);
  }
}

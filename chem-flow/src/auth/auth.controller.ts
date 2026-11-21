import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dtos/login.dto.js';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Login with userId and password', description: 'Works for normal users and the environment-seeded admin account.' })
  @ApiResponse({ status: 201, description: 'Access token issued successfully.' })
  @ApiResponse({ status: 401, description: 'Invalid userId or password.' })
  @Post('login')
  async login(@Body() dto: LoginDto): Promise<{ accessToken: string }> {
    return this.authService.login(dto.userId, dto.password);
  }
}

import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { UsersModule } from '../users/users.module.js';
import { AdminModule } from '../admin/admin.module.js';
import{JwtModule} from '@nestjs/jwt';
import{PassportModule} from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RolesGuard } from './guards/roles.guard.js';
import { JwtStrategy } from './jwt.strategy.js';

@Module({
  controllers: [AuthController],
  providers: [AuthService, RolesGuard, JwtStrategy],
  imports: [UsersModule, AdminModule, ConfigModule, PassportModule, JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRES_IN', '1d') as `${number}${'s' | 'm' | 'h' | 'd'}`,
        },
      }),
    }),
  ],
})
export class AuthModule {}

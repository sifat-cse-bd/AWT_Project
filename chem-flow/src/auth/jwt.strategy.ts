import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AdminService } from '../admin/admin.service.js';
import { UsersService } from '../users/users.service.js';
import { AuthRole } from './auth-user.js';

interface JwtPayload {
  sub: string;
  userId: string;
  role: AuthRole;
  accountType: 'USER' | 'ADMIN';
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly usersService: UsersService,
    private readonly adminService: AdminService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload?.userId || !payload.sub || payload.sub !== payload.userId) {
      throw new UnauthorizedException('Invalid access token');
    }

    if (payload.accountType === 'ADMIN' && payload.role === 'ADMIN') {
      const admin = await this.adminService.findByAdminId(payload.userId);
      if (!admin) throw new UnauthorizedException('Admin account not found');
      return { userId: admin.adminId, role: 'ADMIN', accountType: 'ADMIN' as const };
    }

    if (payload.accountType !== 'USER') {
      throw new UnauthorizedException('Invalid access token');
    }

    const user = await this.usersService.findByUserIdForAuth(payload.userId);
    if (!user || user.role !== payload.role) {
      throw new UnauthorizedException('User account is inactive or no longer valid');
    }
    return { userId: user.userId, role: user.role, accountType: 'USER' as const };
  }
}

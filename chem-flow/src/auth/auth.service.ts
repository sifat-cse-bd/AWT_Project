import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AdminService } from '../admin/admin.service.js';
import { UsersService } from '../users/users.service.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly adminService: AdminService,
    private readonly jwtService: JwtService,
  ) {}

  async login(userId: string, password: string) {
    const user = await this.usersService.findByUserIdForAuth(userId);
    if (user) {
      if (!(await bcrypt.compare(password, user.passwordHash))) { //compares typed pw with db hashedpw
        throw new UnauthorizedException('Invalid user ID or password');
      }

      return {
        accessToken: await this.jwtService.signAsync({
          sub: user.userId,
          userId: user.userId,
          role: user.role,
          accountType: 'USER',
        }),
      };
    }

    const admin = await this.adminService.findForLogin(userId);
    if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
      throw new UnauthorizedException('Invalid user ID or password');
    }

    return {
      accessToken: await this.jwtService.signAsync({
        sub: admin.adminId,
        userId: admin.adminId,
        role: 'ADMIN',
        accountType: 'ADMIN',
      }),
    };
  }
}

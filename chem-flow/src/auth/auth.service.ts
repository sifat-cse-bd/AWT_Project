import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service.js';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService:UsersService,
        private readonly jwtService:JwtService, //for token
    ){}

    async login(userId: string, password: string) {
        const userExists = await this.usersService.findByUserIdForAuth(userId);
        if (!userExists) {
            throw new UnauthorizedException('Invalid user ID or password');
        }

        const checkPW = await bcrypt.compare(password, userExists.passwordHash);
        if (!checkPW) {
            throw new UnauthorizedException('Invalid user ID or password');
        }
        const payload = {
            userId: userExists.userId,
            role: userExists.role
        };

        return { 
            accessToken: await this.jwtService.signAsync(payload),
        };
    }

}

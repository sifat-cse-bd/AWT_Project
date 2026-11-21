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

    async login(email:string, pw:string){
        const userExists = await this.usersService.findByEmailForAuth(email);
        if(!userExists){throw new UnauthorizedException('Invalid email')}

        const checkPW = await bcrypt.compare(pw,userExists.passwordHash);
        if(!checkPW){throw new UnauthorizedException('Invalid email or password')}
        console.log(userExists);
        const payload= {
            userID: userExists.userId,
            userRole: userExists.role
        };

        return { 
            accessToken: await this.jwtService.signAsync(payload),//for encoding
        };
    }


}

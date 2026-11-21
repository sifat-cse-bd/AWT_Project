import { PassportStrategy } from "@nestjs/passport";
import { RegisterableUserRole } from "../users/dto/create-user.dto.js";
import { ConfigService } from "@nestjs/config";
import {ExtractJwt, Strategy} from "passport-jwt"
import { Injectable } from "@nestjs/common";

interface JwtPayLoad{
    userID: string;
    role:RegisterableUserRole;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
    constructor(config: ConfigService){ //injectable for access env
        super({
             //extracts from token in Bearer token
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration:false,
            secretOrKey: config.getOrThrow<string>('JWT_SECRET')
        });
    }

    validate(payload: JwtPayLoad){//checks if key is valid
        return{
            userId: payload.userID,
            role: payload.role
        }
    }
}
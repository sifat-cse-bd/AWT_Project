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
             //extracts token from Bearer token
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration:false,
            secretOrKey: config.getOrThrow<string>('JWT_SECRET') //from env
        });
    }

    validate(payload: JwtPayLoad){//checks if key is valid
        return{//if valid, return these as metadata for guards to verify
            userId: payload.userID,
            role: payload.role
        }
    }
}
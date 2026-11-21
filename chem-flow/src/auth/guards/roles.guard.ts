import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { RegisterableUserRole } from "../../users/dto/create-user.dto.js";
import { ROLES_KEY } from "../decorators/roles.decorator.js";

@Injectable()
export class RolesGuard implements CanActivate{
    constructor(private readonly reflector:Reflector){} //extracts valid roles from metadata for that endpoint
    canActivate(context: ExecutionContext): boolean{
        const availableRoles= this.reflector.getAllAndOverride<RegisterableUserRole[]>(
            ROLES_KEY, 
            [context.getHandler(), context.getClass()]
        );

        if(!availableRoles?.length){return true;}//no guard, anyone can access
        //otherwise guard exists
        const request= context.switchToHttp().getRequest();//extract request
        const user= request.user as {role?:RegisterableUserRole} | undefined; //extract user
        //checks if user exists & if user's role is allowed for this endpoibnt
        if(user && availableRoles.includes(user.role as RegisterableUserRole)){
            return true;
        }
        else{return false;}
    }
}
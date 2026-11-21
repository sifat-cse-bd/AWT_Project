import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorators/roles.decorator.js";
import { AuthRole, AuthUser } from "../auth-user.js";

@Injectable()
export class RolesGuard implements CanActivate{
    constructor(private readonly reflector:Reflector){} //extracts valid roles from metadata for that endpoint
    canActivate(context: ExecutionContext): boolean{
        const availableRoles= this.reflector.getAllAndOverride<AuthRole[]>(
            ROLES_KEY, 
            [context.getHandler(), context.getClass()]
        );

        if(!availableRoles?.length){return true;}//no guard, anyone can access
        //otherwise guard exists
        const request= context.switchToHttp().getRequest();//extract request
        const user= request.user as AuthUser | undefined; //extract user
        //checks if user exists & if user's role is allowed for this endpoibnt
        if(user && availableRoles.includes(user.role)){
            return true;
        }
        else
            {
                throw new ForbiddenException('You do not have permission to perform this operation.'); 
                
            }
    }
}
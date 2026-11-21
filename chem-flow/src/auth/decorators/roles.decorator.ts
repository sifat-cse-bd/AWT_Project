import { SetMetadata } from "@nestjs/common";
import { AuthRole } from "../auth-user.js";

export const ROLES_KEY='roles';

export const Roles=(...roles:AuthRole[])=>
    SetMetadata(ROLES_KEY, roles); //store all roles as metadata for ROLES KEY
    //this will be read by reflector
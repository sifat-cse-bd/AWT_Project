import { SetMetadata } from "@nestjs/common";
import { RegisterableUserRole } from "../../users/dto/create-user.dto.js";

export const ROLES_KEY='roles';

export const Roles=(...roles:RegisterableUserRole[])=>
    SetMetadata(ROLES_KEY, roles); //store all roles as metadata for ROLES KEY
    //this will be read by reflector
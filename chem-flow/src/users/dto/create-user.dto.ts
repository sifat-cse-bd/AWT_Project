import { IsString, IsNotEmpty, IsEmail, IsEnum, MinLength, MaxLength, IsOptional, IsBoolean, Matches } from 'class-validator';
import { UserRole } from '../entities/user.entity.js';

export class CreateUserDto{
    @IsString({ message: 'Name must be a valid string.' })
    @IsNotEmpty({ message: 'Name should not be empty.' })
    @MaxLength(100, { message: 'Name cannot exceed 100 characters.' })
    name: string;

    @IsEmail({}, { message: 'Please provide a valid email address.' })
    @IsNotEmpty({ message: 'Email should not be empty.' })
    @MaxLength(150, { message: 'Email cannot exceed 150 characters.' })
    email: string;

    @IsString({ message: 'Password must be a valid string.' })
    @IsNotEmpty({ message: 'Password should not be empty.' })
    @MinLength(6, { message: 'Password must be at least 6 characters long.' })
    @MaxLength(64, { message: 'Password cannot exceed 64 characters.' })
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*(?:\d|[^a-zA-Z0-9])).+$/,
        {
            message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number or special character.',
        },
    )
    password: string;

    @IsEnum(UserRole, {
        message: 'Role must be one of the following: ADMIN, MANAGER, TECHNICIAN, STUDENT.',
    })
    @IsNotEmpty({ message: 'Role must not be empty.' })
    role: UserRole;

    @IsOptional()
    @IsBoolean({ message: 'isActive must be a boolean value.' })
    isActive?: boolean;
}
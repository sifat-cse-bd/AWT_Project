import { IsString, IsNotEmpty, IsEmail, IsEnum, MinLength, MaxLength, IsOptional, IsBoolean, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum RegisterableUserRole {
    MANAGER = 'MANAGER',
    LAB_ASSISTANT = 'LAB_ASSISTANT',
    STUDENT = 'STUDENT',
}

export class CreateUserDto {

    //entity and dto not matching so I added userId to test auth module
    @IsString()
    @IsNotEmpty({ message: 'Name should not be empty.' })
    @MaxLength(100, { message: 'Name cannot exceed 100 characters.' })
    @ApiProperty({ example: 'Enter User Name' })
    userId: string;
    //--

    @ApiProperty({ example: 'Faruk Ahmed Sifat', description: 'Full name of the person using the lab.' })
    @IsString({ message: 'Name must be a valid string.' })
    @IsNotEmpty({ message: 'Name should not be empty.' })
    @MaxLength(100, { message: 'Name cannot exceed 100 characters.' })
    name: string;

    @ApiProperty({ example: 'faruk@example.com', description: 'Unique email used to sign in.' })
    @IsEmail({}, { message: 'Please provide a valid email address.' })
    @IsNotEmpty({ message: 'Email should not be empty.' })
    @MaxLength(150, { message: 'Email cannot exceed 150 characters.' })
    email: string;

    @ApiProperty({ example: 'LabUser1!', description: 'At least 6 characters, including uppercase, lowercase, and a number or symbol.' })
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

    @ApiProperty({ enum: RegisterableUserRole, example: 'STUDENT', description: 'Available roles are MANAGER, LAB_ASSISTANT, STUDENT' })
    @IsEnum(RegisterableUserRole, {
        message: 'Role must be one of the following: MANAGER, LAB_ASSISTANT, STUDENT.',
    })
    @IsNotEmpty({ message: 'Role must not be empty.' })
    role: RegisterableUserRole;

    @ApiProperty({
        description: 'Define whether user is active',
        example: true,
        required: false,
        default: true
    })
    @IsOptional()
    @IsBoolean({ message: 'isActive must be a boolean value.' })
    isActive?: boolean = true;
}
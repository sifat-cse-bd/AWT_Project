import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'STD-002 or ADM-001', description: 'Public userId or seeded adminId.' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: 'StrongPass1!' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
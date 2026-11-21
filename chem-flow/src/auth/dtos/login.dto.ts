import { ApiProcessingResponse, ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @ApiProperty({example:'ra@gmail.com'})
  email: string;

  @IsString()
  @MinLength(8)
  @ApiProperty({example:'*******'})
  password: string;
}
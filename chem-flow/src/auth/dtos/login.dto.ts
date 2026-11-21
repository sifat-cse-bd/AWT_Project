import { ApiProcessingResponse, ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @ApiProperty({example:'STD-002'})
  userId: string;

  @IsString()
  @MinLength(6)
  @ApiProperty({example:'*******'})
  password: string;
}
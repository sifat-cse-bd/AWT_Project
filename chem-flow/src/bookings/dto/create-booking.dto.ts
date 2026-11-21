import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({
    example: 'Organic chemistry lab session',
    maxLength: 500,
    description: 'Title of the group booking request.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  title: string;

  @ApiProperty({
    example: 'Organic Chemistry Group',
    maxLength: 255,
    description: 'Unique name of the existing group requesting the booking. Only a group member may submit it.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  groupName: string;
}

import { ApiProperty, PartialType } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayUnique, IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateGroupDto {
@ApiProperty({ 
    example: 'Organic Chemistry Lab - Group 1', 
    description: 'Unique name for the student group.' 
  })
  @IsString({ message: 'Group name must be a valid string' }) 
  @IsNotEmpty({ message: 'Group name is required and cannot be empty' }) 
  name: string;

  @ApiProperty({ 
    example: ['STD-001', 'STD-002'], 
    type: [String], 
    required: false, 
    maxItems: 5, 
    description: 'Unique public userIds to add as group members. The creator is automatically included; the total group size cannot exceed five.' 
  })
  @IsOptional() 
  @IsArray({ message: 'Member user IDs must be provided as an array' }) 
  @ArrayUnique({ message: 'Duplicate user IDs are not allowed in the member list' }) 
  @ArrayMaxSize(5, { message: 'You cannot add more than 5 member user IDs' }) 
  @IsString({ each: true, message: 'Each member user ID must be a valid string' }) 
  memberUserIds?: string[];
}



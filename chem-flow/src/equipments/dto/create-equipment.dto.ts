import {IsNotEmpty, IsString, IsEnum, Min, IsInt} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEquipmentDto {
  @ApiProperty({ example: 'Enter Equipment Name' })
  @IsString({message: 'Name must be a valid string.'})
  @IsNotEmpty({message: 'Name cannot be empty.'})
  name: string;

  @ApiProperty({ example: 'Enter Equipment Description' })
  @IsString({message: 'Description must be a valid string.'})
  @IsNotEmpty({message: 'Description cannot be empty.'})
  description: string;

  @ApiProperty({ example: 10 })
  @IsInt({message: 'Total quantity must be a valid integer.'})
  @Min(1, {message: 'Total quantity should at least be 1.'})
  totalQty: number;

  @ApiProperty({ example: 5 })
  @IsInt({message: 'Available quantity must be a valid integer.'})
  @Min(0, {message: 'Available quantity should be a non-negative number.'})
  availability: number;

  @ApiProperty({ example: 'Enter Lab Assistant ID' })
  @IsString({message: 'Lab Assistant ID must be a valid string.'})
  @IsNotEmpty({message: 'Lab Assistant ID cannot be empty.'})
  userId: string;

}

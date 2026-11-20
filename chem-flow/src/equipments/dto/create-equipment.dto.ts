import {IsNotEmpty, IsString, IsEnum, Min, IsInt} from 'class-validator';
import { EquipmentStatus } from '../entities/equipment.entity.js';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEquipmentDto {
  @ApiProperty({ example: 'Enter Equipment Name' })
  @IsString({message: 'Name must be a valid string.'})
  @IsNotEmpty({message: 'Name cannot be empty.'})
  name: string;

  @ApiProperty({ example: 10 })
  @IsInt({message: 'Total quantity must be a valid integer.'})
  @Min(1, {message: 'Total quantity should at least be 1.'})
  totalQty: number;

  @ApiProperty({ example: 5 })
  @IsInt({message: 'Available quantity must be a valid integer.'})
  @Min(0, {message: 'Available quantity should be a non-negative number.'})
  availableQty: number;

  @ApiProperty({ example: 'Enter Equipment Status' })
  @IsEnum(EquipmentStatus, {message: 'Status must be one of the following: OK, BROKEN, REPAIRING.'})
  @IsNotEmpty({message: 'Status cannot be empty.'})
  status: EquipmentStatus;

}
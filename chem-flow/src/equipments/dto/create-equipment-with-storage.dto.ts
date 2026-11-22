import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';
import { CreateEquipmentDto } from './create-equipment.dto.js';

export class CreateEquipmentWithStorageDto extends CreateEquipmentDto {
    @ApiProperty({ example: 3 })
    @IsInt()
    @Min(1)
    storeId: number;
}
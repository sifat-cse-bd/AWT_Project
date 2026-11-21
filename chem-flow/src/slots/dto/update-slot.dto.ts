import { PartialType } from '@nestjs/mapped-types';
import { CreateSlotDto } from './create-slot.dto.js';


export class UpdateSlotDto extends PartialType(CreateSlotDto) {}

import { PartialType } from '@nestjs/swagger';
import { CreateSlotDto } from './create-slot.dto.js';


export class UpdateSlotDto extends PartialType(CreateSlotDto) {}

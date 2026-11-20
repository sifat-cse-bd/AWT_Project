import { PartialType, PickType } from '@nestjs/swagger';
import { CreateBookingDto } from './create-booking.dto.js';

export class UpdateBookingDto extends PartialType(
    PickType(CreateBookingDto, ['purpose', 'startAt', 'endAt'] as const),
) {}
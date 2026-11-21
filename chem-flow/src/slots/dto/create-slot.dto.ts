import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Matches, Min } from 'class-validator';
import { SlotStatus } from '../entities/slot.entity.js';

export class CreateSlotDto {
  @ApiProperty({
    example: '09:00:00',
    description: 'Slot start time using 24-hour HH:mm or HH:mm:ss format.',
  })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/)
  startingTime: string;

  @ApiProperty({
    example: '11:00:00',
    description: 'Slot end time; must be later than startingTime.',
  })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/)
  endingTime: string;

  @ApiProperty({
    example: 'Monday',
    required: false,
    description: 'Day label for a recurring availability slot.',
  })
  @IsOptional()
  @IsString()
  day?: string;

  @ApiProperty({
    example: '2026-12-01',
    required: false,
    description: 'Calendar date in ISO 8601 format for a dated slot.',
  })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({
    example: 10,
    default: 10,
    description: 'Maximum number of users allowed for the slot.',
  })
  @IsInt()
  @Min(0)
  maxCapacity: number;

  @ApiProperty({
    example: 0,
    default: 0,
    required: false,
    description: 'Current number of users assigned to the slot.',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  countCapacity?: number;

  @ApiProperty({
    enum: SlotStatus,
    example: SlotStatus.FREE,
    required: false,
    description: 'Lifecycle state: FREE, BOOKED, CANCELLED, POSTPONED, ACTIVE, or FINISHED.',
  })
  @IsOptional()
  @IsEnum(SlotStatus)
  status?: SlotStatus;

  @ApiProperty({
    example: 1,
    required: false,
    nullable: true,
    description: 'Booking primary key to associate with this slot.',
  })
  @IsOptional()
  @IsInt()
  bookingId?: number | null;

  @ApiProperty({
    example: 'ADM-001',
    required: false,
    nullable: true,
    description: 'Public adminId of the admin who manages this slot.',
  })
  @IsOptional()
  @IsString()
  adminId?: string | null;
}
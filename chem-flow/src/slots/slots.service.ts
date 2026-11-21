import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from '../bookings/entities/booking.entity.js';
import { Slot } from './entities/slot.entity.js';
import { CreateSlotDto } from './dto/create-slot.dto.js'
import { UpdateSlotDto } from './dto/update-slot.dto.js';

@Injectable()
export class SlotsService {
  constructor(
    @InjectRepository(Slot)
    private readonly repo: Repository<Slot>,
    @InjectRepository(Booking)
    private readonly bookingsRepo: Repository<Booking>,
  ) {}

  async create(dto: CreateSlotDto) {
    this.validateTimeRange(dto.startingTime, dto.endingTime);

    const { bookingId, adminId, ...fields } = dto;
    const slot = this.repo.create(fields);

    if (bookingId !== undefined && bookingId !== null) {
      slot.booking = await this.findBookingOrThrow(bookingId);
    }

    const savedSlot = await this.repo.save(slot);
    return {
      message: 'Slot created successfully',
      data: this.toResponse(savedSlot),
    };
  }

  async findAll() {
    const slots = await this.repo.find({
      relations: { booking: true, admin: true },
      order: { date: 'ASC', startingTime: 'ASC' },
    });
    return slots.map((slot) => this.toResponse(slot));
  }

  async findOne(id: number) {
    const slot = await this.find(id);
    return this.toResponse(slot);
  }

  async update(id: number, dto: UpdateSlotDto) {
    const slot = await this.find(id);
    const { bookingId, adminId, ...fields } = dto;

    Object.assign(slot, fields);

    const nextStart = dto.startingTime ?? slot.startingTime;
    const nextEnd = dto.endingTime ?? slot.endingTime;
    this.validateTimeRange(nextStart, nextEnd);

    if (bookingId !== undefined) {
      slot.booking = bookingId ? await this.findBookingOrThrow(bookingId) : null;
    }

    

    const updatedSlot = await this.repo.save(slot);
    return {
      message: 'Slot updated successfully',
      data: this.toResponse(updatedSlot),
    };
  }

  async remove(id: number) {
    await this.find(id);
    await this.repo.softDelete(id);
    return {
      message: 'Slot deleted successfully',
      id,
    };
  }

  // --- Helper Methods ---
  private validateTimeRange(startingTime: string, endingTime: string) {
    if (endingTime <= startingTime) {
      throw new BadRequestException('Ending time must be after starting time');
    }
  }

  private async find(id: number) {
    const item = await this.repo.findOne({
      where: { id },
      relations: { booking: true, admin: true },
    });
    if (!item) {
      throw new NotFoundException(`Slot ${id} not found`);
    }
    return item;
  }

  private async findBookingOrThrow(bookingId: number) {
    const booking = await this.bookingsRepo.findOne({ where: { bookingId } });
    if (!booking) {
      throw new NotFoundException(`Booking ${bookingId} not found`);
    }
    return booking;
  }

  
}
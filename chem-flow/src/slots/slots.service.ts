import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from '../admin/entities/admin.entity.js';
import { Booking } from '../bookings/entities/booking.entity.js';
import { Slot } from './entities/slot.entity.js';
import { CreateSlotDto } from './dto/create-slot.dto.js';
import { UpdateSlotDto } from './dto/update-slot.dto.js';

@Injectable()
export class SlotsService {
  constructor(
    @InjectRepository(Slot)
    private readonly repo: Repository<Slot>,
    @InjectRepository(Booking)
    private readonly bookingsRepo: Repository<Booking>,
    @InjectRepository(Admin)
    private readonly adminsRepo: Repository<Admin>,
  ) {}

  async create(dto: CreateSlotDto) {
    this.validateTimeRange(dto.startingTime, dto.endingTime);

    const { bookingId, adminId, ...fields } = dto;
    const slot = this.repo.create(fields);

    if (bookingId !== undefined && bookingId !== null) {
      slot.booking = await this.findBookingOrThrow(bookingId);
    }
    if (adminId !== undefined && adminId !== null) {
      slot.admin = await this.findAdminOrThrow(adminId);
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
    if (adminId !== undefined) {
      slot.admin = adminId ? await this.findAdminOrThrow(adminId) : null;
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

  private async findAdminOrThrow(adminId: string) {
    const admin = await this.adminsRepo.findOne({ where: { adminId } });
    if (!admin) {
      throw new NotFoundException(`Admin ${adminId} not found`);
    }
    return admin;
  }

  private toResponse(slot: Slot) {
    return {
      id: slot.id,
      startingTime: slot.startingTime,
      endingTime: slot.endingTime,
      day: slot.day,
      date: slot.date,
      maxCapacity: slot.maxCapacity,
      countCapacity: slot.countCapacity,
      status: slot.status,
      bookingId: slot.booking?.bookingId ?? null,
      adminId: slot.admin?.adminId ?? null,
      createdAt: slot.createdAt,
      updatedAt: slot.updatedAt,
      deletedAt: slot.deletedAt,
    };
  }
}
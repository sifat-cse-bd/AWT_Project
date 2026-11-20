import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity.js';
import { Booking, BookingStatus } from './entities/booking.entity.js';
import { CreateBookingDto } from './dto/create-booking.dto.js';
import { UpdateBookingDto } from './dto/update-booking.dto.js';

@Injectable()
export class BookingsService {
    constructor(
        @InjectRepository(Booking)
        private readonly bookingsRepo: Repository<Booking>,
        @InjectRepository(User)
        private readonly usersRepo: Repository<User>,
    ) {}

    async create(dto: CreateBookingDto) {
        const { startAt, endAt } = this.validateSchedule(dto.startAt, dto.endAt);
        const requester = await this.usersRepo.findOne({
            where: { userId: dto.requesterUserId, isActive: true },
        });

        if (!requester) {
            throw new NotFoundException(`Active user ${dto.requesterUserId} not found`);
        }

        const booking = await this.bookingsRepo.save(this.bookingsRepo.create({
            requester,
            startAt,
            endAt,
            purpose: dto.purpose,
            status: BookingStatus.PENDING,
        }));

        return {
            message: 'Booking request created successfully',
            data: this.toResponse(booking),
        };
    }

    async findAll() {
        const bookings = await this.bookingsRepo.find({
            relations: { requester: true },
            order: { startAt: 'ASC' },
        });

        return {
            message: 'Bookings fetched successfully',
            count: bookings.length,
            data: bookings.map((booking) => this.toResponse(booking)),
        };
    }

    async findOne(id: number) {
        const booking = await this.findBooking(id);

        return {
            message: 'Booking found successfully',
            data: this.toResponse(booking),
        };
    }

    async update(id: number, dto: UpdateBookingDto) {
        const booking = await this.findBooking(id);
        this.ensurePending(booking);

        if (dto.startAt !== undefined || dto.endAt !== undefined) {
            const schedule = this.validateSchedule(
                dto.startAt ?? booking.startAt.toISOString(),
                dto.endAt ?? booking.endAt.toISOString(),
            );
            booking.startAt = schedule.startAt;
            booking.endAt = schedule.endAt;
        }

        if (dto.purpose !== undefined) {
            booking.purpose = dto.purpose;
        }

        const updatedBooking = await this.bookingsRepo.save(booking);
        return {
            message: 'Booking updated successfully',
            data: this.toResponse(updatedBooking),
        };
    }

    async cancel(id: number) {
        const booking = await this.findBooking(id);
        this.ensurePending(booking);
        booking.status = BookingStatus.CANCELLED;

        const cancelledBooking = await this.bookingsRepo.save(booking);
        return {
            message: 'Booking cancelled successfully',
            data: this.toResponse(cancelledBooking),
        };
    }

    private async findBooking(id: number) {
        const booking = await this.bookingsRepo.findOne({
            where: { id },
            relations: { requester: true },
        });

        if (!booking) {
            throw new NotFoundException(`Booking ${id} not found`);
        }

        return booking;
    }

    private validateSchedule(startAtValue: string, endAtValue: string) {
        const startAt = new Date(startAtValue);
        const endAt = new Date(endAtValue);

        if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
            throw new BadRequestException('Booking dates must be valid');
        }

        if (startAt <= new Date()) {
            throw new BadRequestException('Booking start time must be in the future');
        }

        if (endAt <= startAt) {
            throw new BadRequestException('Booking end time must be after the start time');
        }

        return { startAt, endAt };
    }

    private ensurePending(booking: Booking) {
        if (booking.status !== BookingStatus.PENDING) {
            throw new ConflictException('Only pending bookings can be changed or cancelled');
        }
    }

    private toResponse(booking: Booking) {
        return {
            id: booking.id,
            requester: {
                userId: booking.requester.userId,
                name: booking.requester.name,
                email: booking.requester.email,
            },
            startAt: booking.startAt,
            endAt: booking.endAt,
            purpose: booking.purpose,
            status: booking.status,
            createdAt: booking.createdAt,
            updatedAt: booking.updatedAt,
        };
    }
}

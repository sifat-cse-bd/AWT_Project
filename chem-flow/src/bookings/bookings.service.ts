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
        const schedule = this.validateSchedule(dto.startAt, dto.endAt);

        const requester = await this.usersRepo.findOne({
            where: { userId: dto.requesterUserId },
        });

        if (!requester) {
            throw new Error(`User ${dto.requesterUserId} not found`);
        }

        const booking = await this.bookingsRepo.save(this.bookingsRepo.create({
            requester,

            startAt: dto.startAt as any,
            endAt: dto.endAt as any,
            purpose: dto.purpose,
        }));

        return {
            message: 'Booking request created successfully',
            data: this.toResponse(booking),
        };
    }

    async findAll() {

        const bookings = await this.bookingsRepo.find({
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

        if (dto.startAt !== undefined || dto.endAt !== undefined) {

            const schedule = this.validateSchedule(
                dto.startAt as string,
                dto.endAt as string,
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

        booking.status = BookingStatus.CANCELLED;

        const cancelledBooking = await this.bookingsRepo.save(booking);
        return {
            message: 'Booking cancelled successfully',
            data: this.toResponse(cancelledBooking),
        };
    }

    private async findBooking(id: number) {
       
    }

    private validateSchedule() {
    }

    private ensurePending(booking: Booking) {
        if (booking.status === BookingStatus.PENDING) {
            throw new ConflictException('Pending bookings cannot be changed');
        }
    }

}
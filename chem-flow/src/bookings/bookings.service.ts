import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import type { AuthUser } from '../auth/auth-user.js';
import { Group } from '../groups/entities/group.entity.js';
import { User, UserRole } from '../users/entities/user.entity.js';
import { CreateBookingDto } from './dto/create-booking.dto.js';
import { UpdateBookingDto } from './dto/update-booking.dto.js';
import { Booking } from './entities/booking.entity.js';

@Injectable()
export class BookingsService {
    constructor(
        @InjectRepository(Booking)
        private readonly bookingsRepo: Repository<Booking>,
        @InjectRepository(User)
        private readonly usersRepo: Repository<User>,
        @InjectRepository(Group)
        private readonly groupsRepo: Repository<Group>,
    ) {}

    async create(dto: CreateBookingDto, actor: AuthUser) {
        if (actor.accountType !== 'USER' || actor.role !== UserRole.STUDENT) {
            throw new ForbiddenException('Only authenticated students can request bookings');
        }

        const group = await this.findGroup(dto.groupId);
        if (!this.isGroupMember(group, actor.userId)) {
            throw new ForbiddenException('Only a group member can request a booking for this group');
        }

        const existingBooking = await this.bookingsRepo.findOne({
            where: { group: { groupId: dto.groupId } },
        });
        if (existingBooking) {
            throw new ConflictException('This group already has a booking request');
        }

        const booking = this.bookingsRepo.create({
            title: dto.title,
            group,
            manager: null,
            cancelAt: null,
        });
        const savedBooking = await this.bookingsRepo.save(booking);
        return {
            message: 'Booking request created successfully',
            data: this.toResponse(savedBooking),
        };
    }

    async findAll(actor: AuthUser) {
        const options: FindManyOptions<Booking> = {
            relations: {
                group: { memberships: { user: true }, createdBy: true },
                manager: true,
            },
            order: { createdAt: 'DESC' },
        };

        if (!this.canViewAll(actor)) {
            options.where = [
                { group: { createdBy: { userId: actor.userId } } },
                { group: { memberships: { user: { userId: actor.userId } } } },
            ];
        }

        const bookings = await this.bookingsRepo.find(options);
        return {
            message: 'Bookings fetched successfully',
            count: bookings.length,
            data: bookings.map((booking) => this.toResponse(booking)),
        };
    }

    async findOne(bookingId: number, actor: AuthUser) {
        const booking = await this.findBooking(bookingId);
        this.ensureCanView(booking, actor);
        return {
            message: 'Booking found successfully',
            data: this.toResponse(booking),
        };
    }

    async update(bookingId: number, dto: UpdateBookingDto, actor: AuthUser) {
        const booking = await this.findBooking(bookingId);
        this.ensureCanManage(booking, actor);
        this.ensureNotCancelled(booking);

        if (dto.title !== undefined) booking.title = dto.title;
        const updatedBooking = await this.bookingsRepo.save(booking);
        return {
            message: 'Booking updated successfully',
            data: this.toResponse(updatedBooking),
        };
    }

    async cancel(bookingId: number, actor: AuthUser) {
        const booking = await this.findBooking(bookingId);
        this.ensureCanManage(booking, actor);
        this.ensureNotCancelled(booking);

        booking.cancelAt = new Date();
        const cancelledBooking = await this.bookingsRepo.save(booking);
        return {
            message: 'Booking cancelled successfully',
            data: this.toResponse(cancelledBooking),
        };
    }

    async approve(bookingId: number, actor: AuthUser) {
        if (actor.accountType !== 'USER' || actor.role !== UserRole.MANAGER) {
            throw new ForbiddenException('Only MANAGER users can approve bookings');
        }

        const booking = await this.findBooking(bookingId);
        this.ensureNotCancelled(booking);
        if (booking.manager) {
            throw new ConflictException('This booking has already been approved');
        }

        const manager = await this.usersRepo.findOne({
            where: {
                userId: actor.userId,
                role: UserRole.MANAGER,
                isActive: true,
            },
        });
        if (!manager) {
            throw new ForbiddenException('An active MANAGER account is required to approve bookings');
        }

        booking.manager = manager;
        const approvedBooking = await this.bookingsRepo.save(booking);
        return {
            message: 'Booking approved successfully',
            data: this.toResponse(approvedBooking),
        };
    }

    private async findBooking(bookingId: number) {
        if (!Number.isInteger(bookingId) || bookingId <= 0) {
            throw new BadRequestException('Invalid booking ID');
        }

        const booking = await this.bookingsRepo.findOne({
            where: { bookingId },
            relations: {
                group: { memberships: { user: true }, createdBy: true },
                manager: true,
            },
        });
        if (!booking) throw new NotFoundException(`Booking ${bookingId} not found`);
        return booking;
    }

    private async findGroup(groupId: string) {
        const group = await this.groupsRepo.findOne({
            where: { groupId },
            relations: { memberships: { user: true }, createdBy: true },
        });
        if (!group) throw new NotFoundException(`Group ${groupId} not found`);
        return group;
    }

    private canViewAll(actor: AuthUser): boolean {
        return actor.accountType === 'ADMIN' || actor.role === UserRole.MANAGER;
    }

    private ensureCanView(booking: Booking, actor: AuthUser) {
        if (!this.canViewAll(actor) && !this.isGroupMember(booking.group, actor.userId)) {
            throw new ForbiddenException('Only group members can view this booking');
        }
    }

    private ensureCanManage(booking: Booking, actor: AuthUser) {
        const isAdmin = actor.accountType === 'ADMIN';
        const isGroupMember =
            actor.accountType === 'USER' && this.isGroupMember(booking.group, actor.userId);
        const isApproved = Boolean(booking.manager ?? booking.userId);

        if (!isAdmin && (!isGroupMember || isApproved)) {
            throw new ForbiddenException('Only group members may manage a booking before approval');
        }
    }

    private ensureNotCancelled(booking: Booking) {
        if (booking.cancelAt) {
            throw new ConflictException('Cancelled bookings cannot be changed');
        }
    }

    private isGroupMember(group: Group, userId: string): boolean {
        const creatorUserId = group.createdBy?.userId ?? group.createdByUserId;
        return (
            creatorUserId === userId ||
            Boolean(group.memberships?.some((membership) => membership.user?.userId === userId))
        );
    }

    private toResponse(booking: Booking) {
        return {
            bookingId: booking.bookingId,
            title: booking.title,
            createdAt: booking.createdAt,
            updatedAt: booking.updatedAt,
            cancelAt: booking.cancelAt ?? null,
            groupId: booking.group?.groupId ?? booking.groupId,
            userId: booking.manager?.userId ?? booking.userId ?? null,
        };
    }
}

import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { AuthUser } from '../auth/auth-user.js';
import { Group } from '../groups/entities/group.entity.js';
import { User, UserRole } from '../users/entities/user.entity.js';
import { CreateBookingDto } from './dto/create-booking.dto.js';
import { UpdateBookingDto } from './dto/update-booking.dto.js';
import { Booking } from './entities/booking.entity.js';
import { AuditService } from '../audit/audit.service.js';

@Injectable()
export class BookingsService {
    constructor(
        @InjectRepository(Booking)//booking repository injection
        private readonly bookingsRepo: Repository<Booking>,//works with the booking entity
        @InjectRepository(User)
        private readonly usersRepo: Repository<User>,
        @InjectRepository(Group)
        private readonly groupsRepo: Repository<Group>,
        private readonly auditService: AuditService,//audit log service injection
    ) {}

    async create(dto: CreateBookingDto, actor: AuthUser) {
        if (actor.accountType !== 'USER' || actor.role !== UserRole.STUDENT) {
            throw new ForbiddenException('Only authenticated students can request bookings');
        }

        const group = await this.findGroup(dto.groupName);
        if (!this.isGroupMember(group, actor.userId)) {
            throw new ForbiddenException('Only a group member can request a booking for this group');
        }

        const existingBooking = await this.bookingsRepo
            .createQueryBuilder('booking')
            .innerJoin('booking.group', 'group')
            .where('group.name = :groupName', { groupName: dto.groupName })
            .getOne();
        if (existingBooking) {
            throw new ConflictException('This group already has a booking request');
        }

        // Create the booking and its audit record atomically.
        const bookingId = await this.bookingsRepo.manager.transaction(async (manager) => {
            const insertResult = await manager
                .getRepository(Booking)
                .createQueryBuilder()
                .insert()
                .into(Booking)
                .values({
                    title: dto.title,
                    group,
                    manager: null,
                    cancelAt: null,
                })
                .returning(['bookingId'])
                .execute();
            const insertedBookingId = insertResult.identifiers[0]?.bookingId;
            if (insertedBookingId === undefined) {
                throw new InternalServerErrorException('Booking ID was not returned');
            }

            await this.auditService.logAction(
                manager,
                'CREATE_BOOKING',
                actor.userId,
                String(insertedBookingId),
                { title: dto.title, groupName: group.name },
                undefined,
            );
            return Number(insertedBookingId);
        });
        const savedBooking = await this.findBooking(bookingId);
        return {
            message: 'Booking request created successfully',
            data: this.toResponse(savedBooking),
        };
    }

    //find all user bookings, if user is admin return all bookings
    async findAll(actor: AuthUser) {
        const query = this.bookingQuery().orderBy('booking.createdAt', 'DESC');

        if (!this.canViewAll(actor)) {
            query.andWhere(
                '(creator.userId = :userId OR member.userId = :userId)',
                { userId: actor.userId },
            );
        }

        const bookings = await query.getMany();
        return {
            message: 'Bookings fetched successfully',
            count: bookings.length,
            data: bookings.map((booking) => this.toResponse(booking)),
        };
    }

    //find a single booking by its ID, ensuring the actor has permission to view it(student,admin)
    async findOne(bookingId: number, actor: AuthUser) {
        const booking = await this.findBooking(bookingId);
        this.ensureCanView(booking, actor);
        return {
            message: 'Booking found successfully',
            data: this.toResponse(booking),
        };
    }

    //updaet title of a booking,(student,admin)
    async update(bookingId: number, dto: UpdateBookingDto, actor: AuthUser) {
        const booking = await this.findBooking(bookingId);
        this.ensureCanManage(booking, actor);
        this.ensureNotCancelled(booking);

        // Keep the booking update and audit record atomic.
        await this.bookingsRepo.manager.transaction(async (manager) => {
            if (dto.title !== undefined) {
                await manager
                    .getRepository(Booking)
                    .createQueryBuilder()
                    .update(Booking)
                    .set({ title: dto.title })
                    .where('"bookingId" = :bookingId', { bookingId })
                    .execute();
            }
            await this.auditService.logAction(
                manager,
                'UPDATE_BOOKING',
                actor.userId,
                bookingId.toString(),
                { oldTitle: booking.title, newTitle: dto.title },
                { updatedAt: new Date() },
            );
        });
        const updatedBooking = await this.findBooking(bookingId);
        return {
            message: 'Booking updated successfully',
            data: this.toResponse(updatedBooking),
        };
    }

    async cancel(bookingId: number, actor: AuthUser) {
        const booking = await this.findBooking(bookingId);
        this.ensureCanManage(booking, actor);
        this.ensureNotCancelled(booking);

        // Keep the cancellation and audit record atomic.
        const cancelAt = new Date();
        await this.bookingsRepo.manager.transaction(async (manager) => {
            await manager
                .getRepository(Booking)
                .createQueryBuilder()
                .update(Booking)
                .set({ cancelAt })
                .where('"bookingId" = :bookingId', { bookingId })
                .execute();
            await this.auditService.logAction(
                manager,
                'CANCEL_BOOKING',
                actor.userId,
                bookingId.toString(),
                { title: booking.title, groupName: booking.groupName },
                { cancelAt },
            );
        });
        const cancelledBooking = await this.findBooking(bookingId);
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

        const manager = await this.usersRepo
            .createQueryBuilder('user')
            .where('user.userId = :userId', { userId: actor.userId })
            .andWhere('user.role = :role', { role: UserRole.MANAGER })
            .andWhere('user.isActive = :isActive', { isActive: true })
            .getOne();
        if (!manager) {
            throw new ForbiddenException('An active MANAGER account is required to approve bookings');
        }

        // Keep the approval and audit record atomic.
        await this.bookingsRepo.manager.transaction(async (transactionManager) => {
            await transactionManager
                .getRepository(Booking)
                .createQueryBuilder()
                .update(Booking)
                .set({ userId: manager.userId })
                .where('"bookingId" = :bookingId', { bookingId })
                .execute();
            await this.auditService.logAction(
                transactionManager,
                'APPROVE_BOOKING',
                actor.userId,
                bookingId.toString(),
                { title: booking.title, approvedBy: actor.userId },
                { approvedAt: new Date() },
            );
        });
        const approvedBooking = await this.findBooking(bookingId);
        return {
            message: 'Booking approved successfully',
            data: this.toResponse(approvedBooking),
        };
    }

    private async findBooking(bookingId: number) {
        if (!Number.isInteger(bookingId) || bookingId <= 0) {
            throw new BadRequestException('Invalid booking ID');
        }

        const booking = await this.bookingQuery()
            .where('booking.bookingId = :bookingId', { bookingId })
            .getOne();
        if (!booking) throw new NotFoundException(`Booking ${bookingId} not found`);
        return booking;
    }

    private async findGroup(groupName: string) {
        const group = await this.groupsRepo
            .createQueryBuilder('group')
            .leftJoinAndSelect('group.memberships', 'membership')
            .leftJoinAndSelect('membership.user', 'member')
            .leftJoinAndSelect('group.createdBy', 'creator')
            .where('group.name = :groupName', { groupName })
            .getOne();
        if (!group) throw new NotFoundException(`Group ${groupName} not found`);
        return group;
    }

    private bookingQuery() {
        return this.bookingsRepo
            .createQueryBuilder('booking')
            .leftJoinAndSelect('booking.group', 'group')
            .leftJoinAndSelect('group.memberships', 'membership')
            .leftJoinAndSelect('membership.user', 'member')
            .leftJoinAndSelect('group.createdBy', 'creator')
            .leftJoinAndSelect('booking.manager', 'manager')
            .distinct(true);
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
            groupName: booking.group?.name ?? booking.groupName,
            userId: booking.manager?.userId ?? booking.userId ?? null,
        };
    }
}

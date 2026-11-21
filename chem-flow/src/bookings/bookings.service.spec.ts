import { ConflictException, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthUser } from '../auth/auth-user.js';
import { Group } from '../groups/entities/group.entity.js';
import { User, UserRole } from '../users/entities/user.entity.js';
import { Booking } from './entities/booking.entity.js';
import { BookingsService } from './bookings.service.js';

describe('BookingsService', () => {
  let bookingsService: BookingsService;
  const bookingsRepo = {
    create: vi.fn(),
    find: vi.fn(),
    findOne: vi.fn(),
    save: vi.fn(),
  };
  const usersRepo = { findOne: vi.fn() };
  const groupsRepo = { findOne: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    bookingsRepo.create.mockImplementation((value) => value);
    bookingsRepo.save.mockImplementation(async (value) => value);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        { provide: getRepositoryToken(Booking), useValue: bookingsRepo },
        { provide: getRepositoryToken(User), useValue: usersRepo },
        { provide: getRepositoryToken(Group), useValue: groupsRepo },
      ],
    }).compile();
    bookingsService = module.get(BookingsService);
  });

  it('lets a student who belongs to the group create one request', async () => {
    const student: AuthUser = {
      userId: 'STD-001',
      role: UserRole.STUDENT,
      accountType: 'USER',
    };
    const group = {
      groupId: 'GRP-261121-001',
      createdBy: { userId: student.userId },
      memberships: [{ user: { userId: student.userId } }],
    };
    groupsRepo.findOne.mockResolvedValue(group);
    bookingsRepo.findOne.mockResolvedValue(null);

    const result = await bookingsService.create(
      { title: 'Lab work', groupId: group.groupId },
      student,
    );

    expect(bookingsRepo.create).toHaveBeenCalledWith({
      title: 'Lab work',
      group,
      manager: null,
      cancelAt: null,
    });
    expect(result.data).toMatchObject({
      title: 'Lab work',
      groupId: group.groupId,
      userId: null,
    });
  });

  it('rejects admin booking creation', async () => {
    const admin: AuthUser = {
      userId: 'ADM-001',
      role: 'ADMIN',
      accountType: 'ADMIN',
    };

    await expect(
      bookingsService.create({ title: 'Lab work', groupId: 'GRP-1' }, admin),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(groupsRepo.findOne).not.toHaveBeenCalled();
  });

  it('rejects a second booking for the same group', async () => {
    const student: AuthUser = {
      userId: 'STD-001',
      role: UserRole.STUDENT,
      accountType: 'USER',
    };
    groupsRepo.findOne.mockResolvedValue({
      groupId: 'GRP-261121-001',
      createdBy: { userId: student.userId },
      memberships: [],
    });
    bookingsRepo.findOne.mockResolvedValue({ bookingId: 5 });

    await expect(
      bookingsService.create(
        { title: 'Lab work', groupId: 'GRP-261121-001' },
        student,
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('lets a manager approve an uncancelled request by assigning their userId', async () => {
    const manager = {
      userId: 'MNG-001',
      role: UserRole.MANAGER,
      isActive: true,
    };
    const booking = {
      bookingId: 5,
      title: 'Lab work',
      groupId: 'GRP-261121-001',
      group: { groupId: 'GRP-261121-001' },
      manager: null,
      userId: null,
      cancelAt: null,
    };
    const actor: AuthUser = {
      userId: manager.userId,
      role: UserRole.MANAGER,
      accountType: 'USER',
    };
    bookingsRepo.findOne.mockResolvedValue(booking);
    usersRepo.findOne.mockResolvedValue(manager);

    const result = await bookingsService.approve(5, actor);

    expect(booking.manager).toBe(manager);
    expect(result.data.userId).toBe(manager.userId);
  });

  it('does not allow admin to approve a booking', async () => {
    const admin: AuthUser = {
      userId: 'ADM-001',
      role: 'ADMIN',
      accountType: 'ADMIN',
    };

    await expect(bookingsService.approve(5, admin))
      .rejects.toBeInstanceOf(ForbiddenException);
    expect(bookingsRepo.findOne).not.toHaveBeenCalled();
  });
});

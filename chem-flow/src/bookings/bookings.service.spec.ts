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
    createQueryBuilder: vi.fn(),
  };
  const usersRepo = { createQueryBuilder: vi.fn() };
  const groupsRepo = { createQueryBuilder: vi.fn() };

  const createQueryBuilder = () => ({
    andWhere: vi.fn().mockReturnThis(),
    distinct: vi.fn().mockReturnThis(),
    execute: vi.fn().mockResolvedValue({
      affected: 1,
      generatedMaps: [],
      identifiers: [{ bookingId: 5 }],
      raw: [{ bookingId: 5 }],
    }),
    getMany: vi.fn(),
    getOne: vi.fn(),
    innerJoin: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    into: vi.fn().mockReturnThis(),
    leftJoinAndSelect: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    returning: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
  });

  let bookingQueryBuilder: ReturnType<typeof createQueryBuilder>;
  let userQueryBuilder: ReturnType<typeof createQueryBuilder>;
  let groupQueryBuilder: ReturnType<typeof createQueryBuilder>;

  beforeEach(async () => {
    vi.clearAllMocks();
    bookingQueryBuilder = createQueryBuilder();
    userQueryBuilder = createQueryBuilder();
    groupQueryBuilder = createQueryBuilder();
    bookingsRepo.createQueryBuilder.mockReturnValue(bookingQueryBuilder);
    usersRepo.createQueryBuilder.mockReturnValue(userQueryBuilder);
    groupsRepo.createQueryBuilder.mockReturnValue(groupQueryBuilder);

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
      name: 'Organic Chemistry Group',
      createdBy: { userId: student.userId },
      memberships: [{ user: { userId: student.userId } }],
    };
    groupQueryBuilder.getOne.mockResolvedValue(group);
    bookingQueryBuilder.getOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        bookingId: 5,
        title: 'Lab work',
        group,
        manager: null,
        cancelAt: null,
        groupName: group.name,
        userId: null,
      });

    const result = await bookingsService.create(
      { title: 'Lab work', groupName: group.name },
      student,
    );

    expect(groupsRepo.createQueryBuilder).toHaveBeenCalledWith('group');
    expect(groupQueryBuilder.where).toHaveBeenCalledWith(
      'group.name = :groupName',
      { groupName: group.name },
    );
    expect(bookingsRepo.createQueryBuilder).toHaveBeenCalled();
    expect(bookingQueryBuilder.values).toHaveBeenCalledWith({
      title: 'Lab work',
      group,
      manager: null,
      cancelAt: null,
    });
    expect(result.data).toMatchObject({
      title: 'Lab work',
      groupName: group.name,
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
      bookingsService.create({ title: 'Lab work', groupName: 'Organic Chemistry Group' }, admin),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(groupsRepo.createQueryBuilder).not.toHaveBeenCalled();
  });

  it('rejects a second booking for the same group', async () => {
    const student: AuthUser = {
      userId: 'STD-001',
      role: UserRole.STUDENT,
      accountType: 'USER',
    };
    groupQueryBuilder.getOne.mockResolvedValue({
      groupId: 'GRP-261121-001',
      name: 'Organic Chemistry Group',
      createdBy: { userId: student.userId },
      memberships: [],
    });
    bookingQueryBuilder.getOne.mockResolvedValue({ bookingId: 5 });

    await expect(
      bookingsService.create(
        { title: 'Lab work', groupName: 'Organic Chemistry Group' },
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
    bookingQueryBuilder.getOne
      .mockResolvedValueOnce(booking)
      .mockResolvedValueOnce({ ...booking, manager });
    userQueryBuilder.getOne.mockResolvedValue(manager);

    const result = await bookingsService.approve(5, actor);

    expect(bookingQueryBuilder.set).toHaveBeenCalledWith({ userId: manager.userId });
    expect(userQueryBuilder.where).toHaveBeenCalledWith(
      'user.userId = :userId',
      { userId: manager.userId },
    );
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
    expect(bookingsRepo.createQueryBuilder).not.toHaveBeenCalled();
  });
});

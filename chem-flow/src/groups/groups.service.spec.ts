import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthUser } from '../auth/auth-user.js';
import { RegisterableUserRole } from '../users/dto/create-user.dto.js';
import { User } from '../users/entities/user.entity.js';
import { Group } from './entities/group.entity.js';
import { Membership } from './entities/membership.entity.js';
import { GroupsService } from './groups.service.js';

describe('GroupsService authorization', () => {
  let groupsService: GroupsService;
  const groupsRepo = {
    count: vi.fn(),
    create: vi.fn((value) => value),
    find: vi.fn(),
    findOne: vi.fn(),
    save: vi.fn((value) => value),
    softDelete: vi.fn(),
  };
  const usersRepo = {
    findBy: vi.fn(),
    findOne: vi.fn(),
  };
  const membershipsRepo = {
    create: vi.fn((value) => value),
    save: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupsService,
        { provide: getRepositoryToken(Group), useValue: groupsRepo },
        { provide: getRepositoryToken(User), useValue: usersRepo },
        { provide: getRepositoryToken(Membership), useValue: membershipsRepo },
      ],
    }).compile();
    groupsService = module.get(GroupsService);
  });

  it('rejects admin group creation', async () => {
    const admin: AuthUser = {
      userId: 'ADM-001',
      role: 'ADMIN',
      accountType: 'ADMIN',
    };

    await expect(groupsService.create({ name: 'Group A' }, admin))
      .rejects.toBeInstanceOf(ForbiddenException);
    expect(groupsRepo.findOne).not.toHaveBeenCalled();
  });

  it('uses the logged-in student as the group creator', async () => {
    const student = {
      userId: 'STD-001',
      name: 'Student One',
      email: 'student@example.com',
      role: RegisterableUserRole.STUDENT,
      isActive: true,
    };
    const actor: AuthUser = {
      userId: student.userId,
      role: RegisterableUserRole.STUDENT,
      accountType: 'USER',
    };
    const savedGroup = {
      groupId: 'GRP-261121-001',
      name: 'Group A',
      createdBy: student,
      createdByUserId: student.userId,
      memberships: [{ membershipId: 1, user: student }],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    groupsRepo.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(savedGroup);
    groupsRepo.count.mockResolvedValue(0);
    usersRepo.findOne.mockResolvedValue(student);
    usersRepo.findBy.mockResolvedValue([student]);
    membershipsRepo.save.mockResolvedValue([]);

    const result = await groupsService.create({ name: 'Group A' }, actor);

    expect(usersRepo.findOne).toHaveBeenCalledWith({
      where: {
        userId: student.userId,
        role: RegisterableUserRole.STUDENT,
        isActive: true,
      },
    });
    expect(result.data.createdBy).toBe(student.userId);
  });

  it('prevents students from viewing groups they do not belong to', async () => {
    const otherStudent = { userId: 'STD-002' };
    groupsRepo.findOne.mockResolvedValue({
      groupId: 'GRP-261121-001',
      createdBy: otherStudent,
      memberships: [{ user: otherStudent }],
    });
    const student: AuthUser = {
      userId: 'STD-001',
      role: RegisterableUserRole.STUDENT,
      accountType: 'USER',
    };

    await expect(groupsService.findOne('GRP-261121-001', student))
      .rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows managers to view any group', async () => {
    const group = {
      groupId: 'GRP-261121-001',
      createdBy: { userId: 'STD-002' },
      memberships: [],
    };
    groupsRepo.findOne.mockResolvedValue(group);
    const manager: AuthUser = {
      userId: 'MNG-001',
      role: RegisterableUserRole.MANAGER,
      accountType: 'USER',
    };

    await expect(groupsService.findOne(group.groupId, manager))
      .resolves.toMatchObject({ groupId: group.groupId });
  });
});

import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import type { AuthUser } from '../auth/auth-user.js';
import { User, UserRole } from '../users/entities/user.entity.js';
import { Group } from './entities/group.entity.js';
import { Membership } from './entities/membership.entity.js';
import { CreateGroupDto } from './dto/create-goup.dto.js';
import { UpdateGroupDto } from './dto/update-group.dto.js';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group) private readonly repo: Repository<Group>,
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    @InjectRepository(Membership) private readonly membershipsRepo: Repository<Membership>,
  ) {}

  async create(dto: CreateGroupDto, actor: AuthUser) {
    if (actor.accountType !== 'USER' || actor.role !== UserRole.STUDENT) {
      throw new ForbiddenException('Only authenticated students can create groups');
    }

    const createdByUserId = actor.userId;
    const existingGroup = await this.repo.findOne({ where: { name: dto.name } });
    if (existingGroup) {
      throw new ConflictException('Group name already exists');
    }

    const memberUserIds = new Set([createdByUserId, ...(dto.memberUserIds ?? [])]);
    if (memberUserIds.size > 5) {
      throw new BadRequestException('A group can have at most 5 members including its creator');
    }

    const createdBy = await this.findStudent(createdByUserId);
    const members = await this.findUsers([...memberUserIds]);

    // group crate and save
    const group = await this.repo.save(
      this.repo.create({
        groupId: await this.generateGroupId(),
        name: dto.name,
        createdBy,
      }),
    );

    // add membership
    if (members.length > 0) {
      const memberships = members.map((user) =>
        this.membershipsRepo.create({ group, user }),
      );
      await this.membershipsRepo.save(memberships);
    }

    const savedGroup = await this.find(group.groupId);
    return {
      message: 'Group created successfully',
      data: this.toResponse(savedGroup),
    };
  }

  async findAll(actor: AuthUser) {
    const query = this.groupQuery().orderBy('group.createdAt', 'DESC');

    if (actor.accountType === 'USER' && actor.role === UserRole.STUDENT) {
      query.andWhere(
        '(creator.userId = :userId OR member.userId = :userId)',
        { userId: actor.userId },
      );
    } else if (actor.accountType === 'USER' && actor.role === UserRole.LAB_ASSISTANT) {
      query
        .andWhere('booking.userId IS NOT NULL')
        .andWhere('booking.cancelAt IS NULL');
    } else if (!this.canViewAllGroups(actor)) {
      throw new ForbiddenException('You are not allowed to view groups');
    }

    const groups = await query.getMany();
    return groups.map((group) => this.toResponse(group));
  }

  async findOne(groupId: string, actor: AuthUser) {
    const group = await this.groupQuery()
      .where('group.groupId = :groupId', { groupId })
      .getOne();
    if (!group) {
      throw new NotFoundException(`Group ${groupId} not found`);
    }
    if (!this.canViewGroup(group, actor)) {
      throw new ForbiddenException('You are not allowed to view this group');
    }
    return this.toResponse(group);
  }

  async update(groupId: string, dto: UpdateGroupDto, actor: AuthUser) {
    const group = await this.find(groupId);
    if (!this.canManageGroup(group, actor)) {
      throw new ForbiddenException('Only the creator, MANAGER, or ADMIN may update this group');
    }

    // old membership replace by new
    let members: User[] | undefined;
    if (dto.memberUserIds !== undefined) {
      const memberUserIds = new Set(dto.memberUserIds);
      const createdByUserId = group.createdBy?.userId ?? group.createdByUserId;

      if (createdByUserId) {
        memberUserIds.add(createdByUserId);
      }
      if (memberUserIds.size > 5) {
        throw new BadRequestException('A group can have at most 5 members including its creator');
      }

      members = await this.findUsers([...memberUserIds]);
    }

    // duplicate name check when update
    if (dto.name !== undefined && dto.name !== group.name) {
      const nameTaken = await this.repo.findOne({ where: { name: dto.name } });
      if (nameTaken) {
        throw new ConflictException('Group name already exists');
      }
      group.name = dto.name;
    }

    await this.repo.save(group);

    if (dto.memberUserIds !== undefined) {
      await this.membershipsRepo.delete({ group: { groupId } });
      if (members && members.length > 0) {
        const memberships = members.map((user) =>
          this.membershipsRepo.create({ group, user }),
        );
        await this.membershipsRepo.save(memberships);
      }
    }

    const updatedGroup = await this.find(groupId);
    return {
      message: 'Group updated successfully',
      data: this.toResponse(updatedGroup),
    };
  }

  async remove(groupId: string, actor: AuthUser) {
    const group = await this.find(groupId);
    if (!this.canManageGroup(group, actor)) {
      throw new ForbiddenException('Only the creator, MANAGER, or ADMIN may delete this group');
    }

    await this.repo.softDelete(groupId);
    return {
      message: 'Group deleted successfully',
      groupId,
    };
  }

  // --- Helper Methods ---

  private async find(groupId: string) {
    const item = await this.repo.findOne({
      where: { groupId },
      relations: { memberships: { user: true }, createdBy: true, booking: true },
    });
    if (!item) {
      throw new NotFoundException(`Group ${groupId} not found`);
    }
    return item;
  }

  private canViewAllGroups(actor: AuthUser): boolean {
    return (
      (actor.accountType === 'ADMIN' && actor.role === 'ADMIN') ||
      (actor.accountType === 'USER' && actor.role === UserRole.MANAGER)
    );
  }

  private canViewGroup(group: Group, actor: AuthUser): boolean {
    if (this.canViewAllGroups(actor)) return true;

    if (actor.accountType === 'USER' && actor.role === UserRole.LAB_ASSISTANT) {
      return Boolean(group.booking?.userId && !group.booking.cancelAt);
    }
    if (actor.accountType !== 'USER' || actor.role !== UserRole.STUDENT) {
      return false;
    }

    const createdByUserId = group.createdBy?.userId ?? group.createdByUserId;
    return (
      createdByUserId === actor.userId ||
      Boolean(group.memberships?.some((membership) => membership.user?.userId === actor.userId))
    );
  }

  private groupQuery() {
    return this.repo
      .createQueryBuilder('group')
      .leftJoinAndSelect('group.memberships', 'membership')
      .leftJoinAndSelect('membership.user', 'member')
      .leftJoinAndSelect('group.createdBy', 'creator')
      .leftJoinAndSelect('group.booking', 'booking')
      .distinct(true);
  }

  private canManageGroup(group: Group, actor: AuthUser): boolean {
    if (this.canViewAllGroups(actor)) return true;
    const createdByUserId = group.createdBy?.userId ?? group.createdByUserId;
    return createdByUserId === actor.userId;
  }

  private async findStudent(userId: string) {
    const student = await this.usersRepo.findOne({
      where: { userId, role: UserRole.STUDENT, isActive: true },
    });
    if (!student) {
      throw new NotFoundException(`Active student ${userId} not found`);
    }
    return student;
  }

private async generateGroupId() {
    const now = new Date();
    const yy = String(now.getUTCFullYear()).slice(-2);
    const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(now.getUTCDate()).padStart(2, '0');

    const prefix = `GRP-${yy}${mm}${dd}-`;

    //fine prefix by today from db
    const count = await this.repo.count({
      where: { groupId: Like(`${prefix}%`) }, 
      withDeleted: true, 
    });

    const nextNumber = String(count + 1).padStart(3, '0');
    return `${prefix}${nextNumber}`;
  }

  private async findUsers(userIds: string[]) {
    const users = await this.usersRepo.findBy({
      userId: In(userIds),
      isActive: true,
    });
    const foundIds = new Set(users.map((user) => user.userId));
    const missingUserId = userIds.find((userId) => !foundIds.has(userId));

    if (missingUserId) {
      throw new NotFoundException(`Active user ${missingUserId} not found`);
    }
    return users;
  }

  private toResponse(group: Group) {
    return {
      groupId: group.groupId,
      name: group.name,
      createdBy: group.createdBy?.userId ?? group.createdByUserId ?? null,
      members:
        group.memberships?.map(({ membershipId, user }) => ({
          membershipId,
          userId: user.userId,
          name: user.name,
          email: user.email,
          role: user.role,
        })) ?? [],
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
      deletedAt: group.deletedAt,
    };
  }
}

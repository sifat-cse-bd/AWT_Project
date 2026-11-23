import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Like, Repository } from 'typeorm';
import { Admin } from '../admin/entities/admin.entity.js';
import type { AuthUser } from '../auth/auth-user.js';
import { CreateUserDto, RegisterableUserRole } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { User } from './entities/user.entity.js';
import { UpdateUserSelfDto } from './dto/update-user-self.dto.js';
import { UpdateUserAdminDto } from './dto/update-user-admin.dto.js';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly usersRepo: Repository<User>,
        @InjectRepository(Admin)
        private readonly adminsRepo: Repository<Admin>,
    ) {}

    private async generateUserId(role: RegisterableUserRole): Promise<string> {
        const prefixes: Record<RegisterableUserRole, string> = {
            STUDENT: 'STD',
            MANAGER: 'MNG',
            LAB_ASSISTANT: 'LAS',
        };
        const prefix = prefixes[role];
        const users = await this.usersRepo.find({
            where: { userId: Like(`${prefix}-%`) },
            withDeleted: true,
            select: { userId: true },
        });

        let nextNumber = 1;
        for (const user of users) {
            const match = new RegExp(`^${prefix}-(\\d+)$`).exec(user.userId);
            if (match) nextNumber = Math.max(nextNumber, Number(match[1]) + 1);
        }
        return `${prefix}-${String(nextNumber).padStart(3, '0')}`;
    }

    private sanitize(user: User) {
        return {
            userId: user.userId,
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            //deletedAt: user.deletedAt,
        };
    }

        private sanitizeDeleted(user: User) {
        return {
            userId: user.userId,
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            deletedAt: user.deletedAt, 
        };
    }
    //for auth
    async findByUserIdForAuth(userId: string) {
        return this.usersRepo.findOne({
            where: { userId, isActive: true },
            select: {
                id: true,
                userId: true,
                passwordHash: true,
                role: true,
                isActive: true,
            },
        });
    }

    async create(dto: CreateUserDto, actor: AuthUser) {
        if (actor.accountType !== 'ADMIN' || actor.role !== 'ADMIN') {
            throw new ForbiddenException('Only admin can create user accounts');
        }

        const existingUser = await this.usersRepo.findOne({
            where: { email: dto.email },
            withDeleted: true,
        });
        if (existingUser) throw new ConflictException('Email already exists');

        const admin = await this.adminsRepo.findOne({ where: { adminId: actor.userId } });
        if (!admin) throw new UnauthorizedException('Admin account is no longer valid');

        const user = this.usersRepo.create({
            userId: await this.generateUserId(dto.role),
            name: dto.name,
            email: dto.email,
            passwordHash: await bcrypt.hash(dto.password, 12),
            role: dto.role,
            isActive: dto.isActive ?? true,
            admin,
        });
        const savedUser = await this.usersRepo.save(user);
        return { message: 'User created successfully', data: this.sanitize(savedUser) };
    }

    async findAll(actor: AuthUser) {
        let users: User[];
        if (actor.accountType === 'ADMIN' && actor.role === 'ADMIN') {
            users = await this.usersRepo.find({
                withDeleted: false,
                order: { createdAt: 'DESC' },
            });
        } else if (actor.role === RegisterableUserRole.MANAGER) {
            users = await this.usersRepo.find({
                where: { role: RegisterableUserRole.LAB_ASSISTANT },
                order: { createdAt: 'DESC' },
            });
        } else {
            throw new ForbiddenException('Use your userId to view your own account');
        }

        return {
            message: 'Users fetched successfully',
            count: users.length,
            data: users.map((user) => this.sanitize(user)),
        };
    }

    async findDeletedUsers(actor: AuthUser) {
        if (actor.accountType !== 'ADMIN' || actor.role !== 'ADMIN') {
            throw new ForbiddenException('Only admin can view deleted users');
        }

        const users = await this.usersRepo.find({
            withDeleted: true, 
            order: { deletedAt: 'DESC' }, 
        });

        return {
            message: 'Deleted users fetched successfully',
            count: users.length,
            data: users.map((user) => this.sanitizeDeleted(user)),
        };
    }

    async findOne(userId: string, actor: AuthUser) {
        if (!userId?.trim()) throw new BadRequestException('User ID is required');

        const isAdmin = actor.accountType === 'ADMIN' && actor.role === 'ADMIN';
        const user = await this.usersRepo.findOne({
            where: { userId },
            withDeleted: isAdmin,
        });
        if (!user) throw new NotFoundException(`User ${userId} not found`);

        if (!isAdmin) {
            const canViewSelf = actor.accountType === 'USER' && actor.userId === user.userId;
            const canManagerViewAssistant =
                actor.accountType === 'USER' &&
                actor.role === RegisterableUserRole.MANAGER &&
                user.role === RegisterableUserRole.LAB_ASSISTANT;
            if (!canViewSelf && !canManagerViewAssistant) {
                throw new ForbiddenException('You are not allowed to view this user');
            }
        }
        return { message: 'User found successfully', data: this.sanitize(user) };
    }

    //Nahian
    async findByUserId(userId: string) {
        return await this.usersRepo.findOne({
            where: {
                userId,
                isActive: true
            },
            select: {
                id: true,
                userId: true,
                role: true,
                isActive: true
            }
        });
    }
    //Nahian

    /*async update(userId: string, dto: UpdateUserDto, actor: AuthUser) {
        if (!userId?.trim()) throw new BadRequestException('User ID is required');
        const user = await this.usersRepo.findOne({ where: { userId } });
        if (!user) throw new NotFoundException(`User ${userId} not found`);

        const isAdmin = actor.accountType === 'ADMIN' && actor.role === 'ADMIN';
        const isSelf = actor.accountType === 'USER' && actor.userId === user.userId;
        if (!isAdmin && !isSelf) {
            throw new ForbiddenException('You can only update your own account');
        }
        if (!isAdmin && (dto.role !== undefined || dto.isActive !== undefined)) {
            throw new ForbiddenException('Only admin can change role or account status');
        }

        if (dto.email && dto.email !== user.email) {
            const emailOwner = await this.usersRepo.findOne({
                where: { email: dto.email },
                withDeleted: true,
            });
            if (emailOwner) throw new ConflictException('Email already exists');
        }

        if (dto.name !== undefined) user.name = dto.name;
        if (dto.email !== undefined) user.email = dto.email;
        if (dto.password !== undefined) user.passwordHash = await bcrypt.hash(dto.password, 12);
        if (isAdmin && dto.role !== undefined) user.role = dto.role;
        if (isAdmin && dto.isActive !== undefined) user.isActive = dto.isActive;

        const updatedUser = await this.usersRepo.save(user);
        return { message: 'User updated successfully', data: this.sanitize(updatedUser) };
    }*/

  //user update only for self
  async updateUserOnly(userId: string, dto: UpdateUserSelfDto, actor: AuthUser) {
    if (!userId?.trim()) throw new BadRequestException('User ID is required');
    
    const user = await this.usersRepo.findOne({ where: { userId } });
    if (!user) throw new NotFoundException(`User ${userId} not found`);

  
    if (actor.accountType !== 'USER' || actor.userId !== user.userId) {
      throw new ForbiddenException('You can only update your own account');
    }

    if (dto.email && dto.email !== user.email) {
      const emailOwner = await this.usersRepo.findOne({
        where: { email: dto.email },
        withDeleted: true,
      });
      if (emailOwner) throw new ConflictException('Email already exists');
    }

    if (dto.name !== undefined) user.name = dto.name;
    if (dto.email !== undefined) user.email = dto.email;
    if (dto.password !== undefined) user.passwordHash = await bcrypt.hash(dto.password, 12);

    const updatedUser = await this.usersRepo.save(user);
    return { message: 'User updated successfully', data: this.sanitize(updatedUser) };
  }

  // Admin
  async updateAdminOnly(userId: string, dto: UpdateUserAdminDto, actor: AuthUser) {
    if (actor.accountType !== 'ADMIN' || actor.role !== 'ADMIN') {
      throw new ForbiddenException('Only admin can perform this action');
    }
    if (!userId?.trim()) throw new BadRequestException('User ID is required');
    
    const user = await this.usersRepo.findOne({ where: { userId } });
    if (!user) throw new NotFoundException(`User ${userId} not found`);

    if (dto.email && dto.email !== user.email) {
      const emailOwner = await this.usersRepo.findOne({
        where: { email: dto.email },
        withDeleted: true,
      });
      if (emailOwner) throw new ConflictException('Email already exists');
    }

    if (dto.name !== undefined) user.name = dto.name;
    if (dto.email !== undefined) user.email = dto.email;
    if (dto.password !== undefined) user.passwordHash = await bcrypt.hash(dto.password, 12);
    if (dto.role !== undefined) user.role = dto.role;
    if (dto.isActive !== undefined) user.isActive = dto.isActive;

    const updatedUser = await this.usersRepo.save(user);
    return { message: 'User updated successfully by Admin', data: this.sanitize(updatedUser) };
  }

    async remove(userId: string, actor: AuthUser) {
        if (actor.accountType !== 'ADMIN' || actor.role !== 'ADMIN') {
            throw new ForbiddenException('Only admin can delete user accounts');
        }
        if (!userId?.trim()) throw new BadRequestException('User ID is required');

        const user = await this.usersRepo.findOne({ where: { userId } });
        if (!user) throw new NotFoundException(`User ${userId} not found`);

        user.isActive = false;
        await this.usersRepo.save(user);
        await this.usersRepo.softDelete(user.id);
        return { message: 'User deleted successfully', userId: user.userId };
    }

    //Nahian
    async hardRemove(userId: string)
    {
        const user = await this.findByUserId(userId);
        
        if(!user)
            {
                throw new NotFoundException('Not Found User');
            }
        await this.usersRepo.remove(user);
        return { message: 'User permanently deleted successfully.',

        };//Nahian
        
        
    }
        
}

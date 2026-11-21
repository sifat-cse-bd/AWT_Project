import { Injectable, NotFoundException, ConflictException, InternalServerErrorException, BadRequestException, HttpException, ServiceUnavailableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { User } from './entities/user.entity.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import * as bcrypt from 'bcrypt';
import { Admin } from 'typeorm/driver/mongodb/typings.js';
import { ConfigService } from '@nestjs/config';



@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepo: Repository<User>,
        @InjectRepository(Admin)
        private adminsRepo: Repository<Admin>,
        private readonly configService: ConfigService,
    ) { }

    private async generateUserId(role: CreateUserDto['role']): Promise<string> {
        try {
            const prefixes: Record<CreateUserDto['role'], string> = {
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
                const match = /^([A-Z]+)-(\d+)$/.exec(user.userId);
                if (match?.[1] === prefix) {
                    nextNumber = Math.max(nextNumber, Number(match[2]) + 1);
                }
            }

            return `${prefix}-${String(nextNumber).padStart(3, '0')}`;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to generate user ID');
        }
    }

    //FOR AUTH-----------------------------------
    async findByEmailForAuth(email: string) {
        return this.usersRepo.findOne({
            where: { email, isActive: true },
            select: {
                id: true,
                userId: true,
                email: true,
                passwordHash: true,
                role: true,
                isActive: true,
            },
        });
    }
    //-------------------------------------------


    async create(dto: CreateUserDto) {
        try {
            const existingUser = await this.usersRepo.findOne({ where: { email: dto.email } });

            if (existingUser) {
                throw new ConflictException('Email already exists');
            }

            // pass hashing
            let hashedPass = await bcrypt.hash(dto.password, 12); //ecryp key length 12
            const userId = await this.generateUserId(dto.role);
            const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
            const admin = adminEmail
                ? await this.adminsRepo.findOne({ where: { email: adminEmail } })
                : null;
            if (!admin) {
                throw new ServiceUnavailableException('The environment-configured admin account is not initialized');
            }

            const user = this.usersRepo.create({
                userId,
                name: dto.name,
                email: dto.email,
                passwordHash: hashedPass, 
                role: dto.role,
                isActive: dto.isActive,
                admin,
            });

            const savedUser = await this.usersRepo.save(user);

            //delete hashpassword for : not return in the response
            const { passwordHash, ...userWithoutPass } = savedUser; //destructures to remove hashedpass
            return {
                message: 'User created successfully',
                data: savedUser,
            };
        } catch (error) {
            throw error;
        }
    }

    async findAll() {
        try {
            const users = await this.usersRepo.find({
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    isActive: true,
                    createdAt: true,
                },
                order: { createdAt: 'DESC' },
            });

            if (!users || users.length === 0) {
                throw new NotFoundException('No users found');
            }

            return {
                message: 'Users fetched successfully',
                count: users.length,
                data: users,
            };

        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }

            throw new InternalServerErrorException('Failed to fetch users');
        }
    }

    //find one by one user
    async findOne(id: number) {
        try {
            // Validate ID
            if (!id || !Number.isInteger(id) || id <= 0) {
                throw new BadRequestException('Invalid user ID');
            }

            const user = await this.usersRepo.findOne({
                where: { id },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    isActive: true,
                    createdAt: true,
                },
            });

            // Check if user exists
            if (!user) {
                throw new NotFoundException(`User with ID ${id} not found`);
            }

            return {
                message: 'User found successfully',
                data: user,
            };

        } catch (error) {
            if (
                error instanceof BadRequestException ||
                error instanceof NotFoundException
            ) {
                throw error;
            }

            throw new InternalServerErrorException('Failed to fetch user');
        }
    }

    // update user
    async update(id: number, dto: UpdateUserDto) {
        try {
            // Validate ID
            if (!id || !Number.isInteger(id) || id <= 0) {
                throw new BadRequestException('Invalid user ID');
            }

            // Check if user exists
            const user = await this.usersRepo.findOne({ where: { id } });

            if (!user) {
                throw new NotFoundException(`User with ID ${id} not found`);
            }

            // Check duplicate email
            if (dto.email && dto.email !== user.email) {
                const existingUser = await this.usersRepo.findOne({
                    where: { email: dto.email },
                });

                if (existingUser) {
                    throw new ConflictException('Email already exists');
                }
            }

            // Update allowed fields only
            if (dto.name !== undefined) {
                user.name = dto.name;
            }

            if (dto.email !== undefined) {
                user.email = dto.email;
            }

            if (dto.role !== undefined) {
                user.role = dto.role;
            }

            if (dto.isActive !== undefined) {
                user.isActive = dto.isActive;
            }

            // Hash password before updating
            // if (dto.password) {
            //     user.passwordHash = await bcrypt.hash(dto.password, 10);
            // }

            // Save updated user
            const updatedUser = await this.usersRepo.save(user);

            // Remove password hash from response
            //delete updatedUser.passwordHash;

            return {
                message: 'User updated successfully',
                data: updatedUser,
            };

        } catch (error) {
            if (
                error instanceof BadRequestException ||
                error instanceof NotFoundException ||
                error instanceof ConflictException
            ) {
                throw error;
            }

            throw new InternalServerErrorException('Failed to update user');
        }
    }

    //delete
    async remove(id: number) {
        try {
            // Validate ID
            if (!id || !Number.isInteger(id) || id <= 0) {
                throw new BadRequestException('Invalid user ID');
            }

            // Check if user exists
            const user = await this.usersRepo.findOne({
                where: { id },
            });

            if (!user) {
                throw new NotFoundException(`User with ID ${id} not found`);
            }

            // Soft delete user
            await this.usersRepo.softDelete(id);

            return {
                message: 'User deleted successfully',
                id,
            };

        } catch (error) {
            if (
                error instanceof BadRequestException ||
                error instanceof NotFoundException
            ) {
                throw error;
            }

            throw new InternalServerErrorException('Failed to delete user');
        }
    }



}

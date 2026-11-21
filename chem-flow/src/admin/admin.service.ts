import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Admin } from './entities/admin.entity.js';

@Injectable()
export class AdminService implements OnModuleInit {
  constructor(
    @InjectRepository(Admin)
    private readonly adminsRepo: Repository<Admin>,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    const existingAdmin = await this.adminsRepo.find({
      select: { adminId: true },
      take: 1,
    });
    if (existingAdmin.length > 0) return;

    const adminId = this.requiredSeedValue('ADMIN_ID');
    const name = this.requiredSeedValue('ADMIN_NAME');
    const email = this.requiredSeedValue('ADMIN_EMAIL');
    const password = this.requiredSeedValue('ADMIN_PASSWORD');
    const admin = this.adminsRepo.create({
      adminId,
      name,
      email,
      passwordHash: await bcrypt.hash(password, 12),
    });
    await this.adminsRepo.save(admin);
  }

  async findForLogin(adminId: string) {
    return this.adminsRepo.findOne({
      where: { adminId },
      select: { adminId: true, passwordHash: true },
    });
  }

  async findByAdminId(adminId: string) {
    return this.adminsRepo.findOne({
      where: { adminId },
      select: { adminId: true },
    });
  }

  private requiredSeedValue(key: string): string {
    const value = this.configService.get<string>(key)?.trim();
    if (!value) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
  }
}

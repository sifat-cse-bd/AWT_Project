import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Admin } from './entities/admin.entity.js';
import { AdminService } from './admin.service.js';

describe('AdminService seed', () => {
  const adminsRepo = {
    find: vi.fn(),
    create: vi.fn((admin) => admin),
    save: vi.fn((admin) => admin),
  };
  const seed = {
    ADMIN_ID: 'ADM-001',
    ADMIN_NAME: 'Lab Admin',
    ADMIN_EMAIL: 'admin@example.com',
    ADMIN_PASSWORD: 'SeedPass1!',
  };
  const configService = {
    get: vi.fn((key: keyof typeof seed) => seed[key]),
  };
  let adminService: AdminService;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: getRepositoryToken(Admin), useValue: adminsRepo },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();
    adminService = module.get(AdminService);
  });

  it('does not replace an already-seeded admin', async () => {
    adminsRepo.find.mockResolvedValue([{ adminId: 'ADM-001' }]);

    await adminService.onModuleInit();

    expect(adminsRepo.save).not.toHaveBeenCalled();
  });

  it('seeds the admin once with a bcrypt password hash', async () => {
    adminsRepo.find.mockResolvedValue([]);

    await adminService.onModuleInit();

    const savedAdmin = adminsRepo.save.mock.calls[0][0];
    expect(savedAdmin).toMatchObject({
      adminId: seed.ADMIN_ID,
      name: seed.ADMIN_NAME,
      email: seed.ADMIN_EMAIL,
    });
    expect(savedAdmin.passwordHash).not.toBe(seed.ADMIN_PASSWORD);
    await expect(bcrypt.compare(seed.ADMIN_PASSWORD, savedAdmin.passwordHash)).resolves.toBe(true);
  });
});

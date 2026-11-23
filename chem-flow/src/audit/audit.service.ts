import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity.js';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  async logAction(
    manager: EntityManager,
    action: string,
    performedBy: string,
    targetId: string | undefined,
    details: Record<string, unknown> | undefined,
    timestamps:
      | {
          updatedAt?: Date;
          deletedAt?: Date;
          cancelAt?: Date;
          approvedAt?: Date;
        }
      | undefined,
  ) {
    // Reuse the caller's transaction so audit failures roll back the related write.
    const auditRepo = manager.getRepository(AuditLog);
    const log = auditRepo.create({
      action,
      performedBy,
      targetId,
      details,
      ...timestamps,
    });
    return auditRepo.save(log);
  }

  async findAll(page: number, limit: number) {
    // Load only one bounded page, with a stable newest-first ordering.
    const [data, total] = await this.auditRepo.findAndCount({
      order: { createdAt: 'DESC', id: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }
}

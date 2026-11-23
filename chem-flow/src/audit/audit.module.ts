import { Module } from '@nestjs/common';
import { AuditService } from './audit.service.js';
import { AuditController } from './audit.controller.js';
import { AuditLog } from './entities/audit-log.entity.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog])],
  providers: [AuditService, JwtAuthGuard, RolesGuard],
  controllers: [AuditController],
  exports: [AuditService],
})
export class AuditModule {}

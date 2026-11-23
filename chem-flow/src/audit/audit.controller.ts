import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuditService } from './audit.service.js';
import { AuditPaginationDto } from './dto/audit-pagination.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

// This label is displayed as the Swagger section heading.
@ApiTags('Audit Log')
@ApiBearerAuth()
@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @ApiOperation({
    summary: 'Get all audit logs',
    description: 'Only ADMIN can view audit logs of users and bookings.',
  })
  // Document the expected success and authorization/validation errors.
  @ApiResponse({ status: 200, description: 'Audit logs returned.' })
  @ApiResponse({ status: 400, description: 'Invalid page or limit value.' })
  @ApiResponse({ status: 401, description: 'Bearer token missing or invalid.' })
  @ApiResponse({ status: 403, description: 'Only ADMIN can view audit logs.' })
  @Get()
  @Roles('ADMIN')
  // Global ValidationPipe transforms and validates page/limit query values.
  findAll(@Query() pagination: AuditPaginationDto) {
    return this.auditService.findAll(pagination.page, pagination.limit);
  }
}

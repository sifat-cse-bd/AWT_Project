import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupsService } from './groups.service.js';
import { GroupsController } from './groups.controller.js';
import { Group } from './entities/group.entity.js';
import { User } from '../users/entities/user.entity.js';
import { Membership } from './entities/membership.entity.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';

@Module({
  imports: [TypeOrmModule.forFeature([Group, User, Membership])],
  controllers: [GroupsController],
  providers: [GroupsService, JwtAuthGuard, RolesGuard],
})
export class GroupsModule {}

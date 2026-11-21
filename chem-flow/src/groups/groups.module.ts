import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupsService } from './groups.service.js';
import { GroupsController } from './groups.controller.js';
import { Group } from './entities/group.entity.js';
import { User } from '../users/entities/user.entity.js';
import { Membership } from './entities/membership.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Group, User, Membership])],
  controllers: [GroupsController],
  providers: [GroupsService],
})
export class GroupsModule {}

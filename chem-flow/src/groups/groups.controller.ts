import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { AuthUser } from '../auth/auth-user.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { RegisterableUserRole } from '../users/dto/create-user.dto.js';
import { GroupsService } from './groups.service.js';
import { CreateGroupDto } from './dto/create-goup.dto.js';
import { UpdateGroupDto } from './dto/update-group.dto.js';

@ApiTags('groups')
@ApiBearerAuth()
@Controller('groups')
@UseGuards(JwtAuthGuard)
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @ApiOperation({
    summary: 'Create a lab group',
    description: 'Only an authenticated STUDENT can create a group. Omit memberUserIds or send an empty array to create a solo group; maximum total membership is five including the creator.',
  })
  @ApiResponse({ status: 201, description: 'Group created with its membership list.' })
  @ApiResponse({ status: 401, description: 'Authentication required.' })
  @ApiResponse({ status: 403, description: 'Only STUDENT users can create groups.' })
  @ApiResponse({ status: 404, description: 'A member userId does not identify an active user.' })
  @ApiResponse({ status: 409, description: 'A group already uses this name.' })
  @ApiResponse({ status: 400, description: 'Invalid body, duplicate memberUserIds, or the group would exceed five total members including its creator.' })
  @Post()
  @UseGuards(RolesGuard)
  @Roles(RegisterableUserRole.STUDENT)
  create(@Body() dto: CreateGroupDto, @Req() request: { user: AuthUser }) {
    return this.groupsService.create(dto, request.user);
  }

  @ApiOperation({
    summary: 'List lab groups',
    description: 'Students see groups they belong to; MANAGER and ADMIN see all groups; LAB_ASSISTANT sees groups with an active approved booking.',
  })
  @ApiResponse({ status: 200, description: 'Group list returned.' })
  @Get()
  findAll(@Req() request: { user: AuthUser }) {
    return this.groupsService.findAll(request.user);
  }

  @ApiOperation({
    summary: 'Get group details',
    description: 'Students may view groups they belong to; MANAGER and ADMIN may view any group; LAB_ASSISTANT may view groups with an active approved booking.',
  })
  @ApiParam({
    name: 'groupId',
    description: 'Generated group identifier with UTC date and time',
    example: 'GRP-20261121-144720-472-9F3A2C10',
  })
  @ApiResponse({ status: 401, description: 'Authentication required.' })
  @ApiResponse({ status: 403, description: 'You are not a member of this group.' })
  @ApiResponse({ status: 404, description: 'Group not found.' })
  @Get(':groupId')
  findOne(@Param('groupId') groupId: string, @Req() request: { user: AuthUser }) {
    return this.groupsService.findOne(groupId, request.user);
  }

  @ApiOperation({
    summary: 'Update a lab group',
    description: 'Updates the unique group name and, when memberUserIds is supplied, replaces the members while retaining the creator. Total members cannot exceed five.',
  })
  @ApiParam({
    name: 'groupId',
    description: 'Generated group identifier with UTC date and time',
    example: '',
  })
  @ApiResponse({ status: 404, description: 'Group or referenced active userId not found.' })
  @ApiResponse({ status: 403, description: 'Only the creator, MANAGER, or ADMIN may update this group.' })
  @ApiResponse({ status: 409, description: 'A group already uses this name.' })
  @ApiResponse({ status: 400, description: 'Invalid body or the group would exceed five total members including its creator.' })
  @Patch(':groupId')
  update(
    @Param('groupId') groupId: string,
    @Body() dto: UpdateGroupDto,
    @Req() request: { user: AuthUser },
  ) {
    return this.groupsService.update(groupId, dto, request.user);
  }

  @ApiOperation({
    summary: 'Delete a lab group',
    description: 'Soft-deletes a group; the group and its membership history remain in the database.',
  })
  @ApiParam({
    name: 'groupId',
    description: 'Generated group identifier with UTC date and time',
    example: '',
  })
  @ApiResponse({ status: 404, description: 'Group not found.' })
  @ApiResponse({ status: 403, description: 'Only the creator, MANAGER, or ADMIN may delete this group.' })
  @Delete(':groupId')
  remove(@Param('groupId') groupId: string, @Req() request: { user: AuthUser }) {
    return this.groupsService.remove(groupId, request.user);
  }
}

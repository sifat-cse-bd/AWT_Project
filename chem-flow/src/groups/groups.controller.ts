import { Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GroupsService } from './groups.service.js';
import { CreateGroupDto } from './dto/create-goup.dto.js';
import { UpdateGroupDto } from './dto/update-group.dto.js';

@ApiTags('groups')
@ApiBearerAuth()
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @ApiOperation({
    summary: 'Create a lab group',
    description: 'Creates a uniquely named group. Omit memberUserIds or send an empty array to create a solo group; maximum total membership is five including the creator.',
  })
  @ApiResponse({ status: 201, description: 'Group created with its membership list.' })
  @ApiResponse({ status: 404, description: 'A member userId does not identify an active user.' })
  @ApiResponse({ status: 409, description: 'A group already uses this name.' })
  @ApiResponse({ status: 400, description: 'Invalid body, duplicate memberUserIds, or the group would exceed five total members including its creator.' })
  @Post()
  create(@Body() dto: CreateGroupDto) {
    return this.groupsService.create(dto);
  }

  @ApiOperation({
    summary: 'List lab groups',
    description: 'Returns groups with their members and creator details.',
  })
  @ApiResponse({ status: 200, description: 'Group list returned.' })
  @Get()
  findAll() {
    return this.groupsService.findAll();
  }

  @ApiOperation({
    summary: 'Get group details',
    description: 'Returns a group by its groupId primary key and its current member list.',
  })
  @ApiParam({
    name: 'groupId',
    description: 'Generated group identifier with UTC date and time',
    example: 'GRP-20261121-144720-472-9F3A2C10',
  })
  @ApiResponse({ status: 404, description: 'Group not found.' })
  @Get(':groupId')
  findOne(@Param('groupId') groupId: string) {
    return this.groupsService.findOne(groupId);
  }

  @ApiOperation({
    summary: 'Update a lab group',
    description: 'Updates the unique group name and, when memberUserIds is supplied, replaces the members while retaining the creator. Total members cannot exceed five.',
  })
  @ApiParam({
    name: 'groupId',
    description: 'Generated group identifier with UTC date and time',
    example: 'GRP-20261121-144720-472-9F3A2C10',
  })
  @ApiResponse({ status: 404, description: 'Group or referenced active userId not found.' })
  @ApiResponse({ status: 409, description: 'A group already uses this name.' })
  @ApiResponse({ status: 400, description: 'Invalid body or the group would exceed five total members including its creator.' })
  @Patch(':groupId')
  update(@Param('groupId') groupId: string, @Body() dto: UpdateGroupDto) {
    return this.groupsService.update(groupId, dto);
  }

  @ApiOperation({
    summary: 'Delete a lab group',
    description: 'Soft-deletes a group; the group and its membership history remain in the database.',
  })
  @ApiParam({
    name: 'groupId',
    description: 'Generated group identifier with UTC date and time',
    example: 'GRP-20261121-144720-472-9F3A2C10',
  })
  @ApiResponse({ status: 404, description: 'Group not found.' })
  @Delete(':groupId')
  remove(@Param('groupId') groupId: string) {
    return this.groupsService.remove(groupId);
  }
}

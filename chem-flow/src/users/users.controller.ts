import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthUser } from '../auth/auth-user.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UpdateUserSelfDto } from './dto/update-user-self.dto.js';
import { UpdateUserAdminDto } from './dto/update-user-admin.dto.js';
import { RegisterableUserRole } from './dto/create-user.dto.js';
import { UsersService } from './users.service.js';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Admin creates a user account',
    description: 'Only ADMIN may create STUDENT, MANAGER, or LAB_ASSISTANT accounts.',
  })
  @ApiResponse({ status: 201, description: 'User created successfully.' })
  @ApiResponse({ status: 401, description: 'Authentication required.' })
  @ApiResponse({ status: 403, description: 'Only ADMIN may create users.' })
  @Post('create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  create(@Body() dto: CreateUserDto, @Req() request: { user: AuthUser }) {
    return this.usersService.create(dto, request.user);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List all deleted users',
    description: 'Only ADMIN can view the list of soft-deleted user accounts.',
  })
  @ApiResponse({ status: 200, description: 'Deleted users retrieved successfully.' })
  @ApiResponse({ status: 401, description: 'Authentication required.' })
  @ApiResponse({ status: 403, description: 'Only ADMIN can view deleted users.' })
  @Get('deleted')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findDeleted(@Req() request: { user: AuthUser }) {
    return this.usersService.findDeletedUsers(request.user);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List visible users',
    description: 'ADMIN sees all records; MANAGER sees LAB_ASSISTANT accounts. Other users must search by their own userId.',
  })
  @ApiResponse({ status: 200, description: 'Visible users retrieved successfully.' })
  @ApiResponse({ status: 403, description: 'This role cannot list users.' })
  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Req() request: { user: AuthUser }) {
    return this.usersService.findAll(request.user);
  }


  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get a user by public ID',
    description: 'Users can view their own profile; MANAGER can also view LAB_ASSISTANT profiles; ADMIN can view every record.',
  })
  @ApiParam({ name: 'userId', example: 'STD-001', description: 'Public user ID, not the internal numeric database ID.' })
  @ApiResponse({ status: 200, description: 'User found successfully.' })
  @ApiResponse({ status: 403, description: 'You are not allowed to view this user.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @Get(':userId')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('userId') userId: string, @Req() request: { user: AuthUser }) {
    return this.usersService.findOne(userId, request.user);
  }

  
  /*@ApiBearerAuth()
  @ApiOperation({
    summary: 'Update account details',
    description: 'Every user may update their own name, email, and password. Only ADMIN may change roles or account status.',
  })
  @ApiParam({ name: 'userId', example: 'STD-001', description: 'Public user ID.' })
  @ApiResponse({ status: 200, description: 'User updated successfully.' })
  @ApiResponse({ status: 403, description: 'Only the account owner or ADMIN may update this account.' })
  @Patch(':userId')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('userId') userId: string,
    @Body() dto: UpdateUserDto,
    @Req() request: { user: AuthUser },
  ) {
    return this.usersService.update(userId, dto, request.user);
  }*/


    //user update only for self
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update account details',
    description: 'Every user may update their own name, email, and password. Only ADMIN may change roles or account status.',
  })
  @ApiParam({ name: 'userId', example: 'STD-001', description: 'Public user ID.' })
  @ApiResponse({ status: 200, description: 'User updated successfully.' })
  @ApiResponse({ status: 403, description: 'Only the account owner or ADMIN may update this account.' })
  @Patch(':userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
  RegisterableUserRole.STUDENT, 
  RegisterableUserRole.MANAGER, 
  RegisterableUserRole.LAB_ASSISTANT
)
  updateUser(
    @Param('userId') userId: string,
    @Body() dto: UpdateUserSelfDto, //
    @Req() request: { user: AuthUser },
  ) {
    return this.usersService.updateUserOnly(userId, dto, request.user);
  }

  //Admin
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update account details',
    description: 'Every user may update their own name, email, and password. Only ADMIN may change roles or account status.',
  })
  @ApiParam({ name: 'userId', example: 'STD-001', description: 'Public user ID.' })
  @ApiResponse({ status: 200, description: 'User updated successfully.' })
  @ApiResponse({ status: 403, description: 'Only the account owner or ADMIN may update this account.' })
  @ApiParam({ name: 'userId', example: 'STD-001', description: 'Public user ID.' })
  @Patch('admin/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  updateAdmin(
    @Param('userId') userId: string,
    @Body() dto: UpdateUserAdminDto, // only admin 
    @Req() request: { user: AuthUser },
  ) {
    return this.usersService.updateAdminOnly(userId, dto, request.user);
  }


  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Soft-delete a user account',
    description: 'Only ADMIN may deactivate and soft-delete an account. The record is preserved.',
  })
  @ApiParam({ name: 'userId', example: 'STD-001', description: 'Public user ID.' })
  @ApiResponse({ status: 200, description: 'User deleted successfully.' })
  @ApiResponse({ status: 403, description: 'Only ADMIN may delete user accounts.' })
  @Delete(':userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('userId') userId: string, @Req() request: { user: AuthUser }) {
    return this.usersService.remove(userId, request.user);
  }

}

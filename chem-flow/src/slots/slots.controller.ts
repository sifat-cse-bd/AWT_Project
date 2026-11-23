import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SlotsService } from './slots.service.js';
import { CreateSlotDto } from './dto/create-slot.dto.js';
import { UpdateSlotDto } from './dto/update-slot.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { RegisterableUserRole } from '../users/dto/create-user.dto.js';

@ApiTags('Slots')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('slots')
export class SlotsController {
  constructor(private readonly slotsService: SlotsService) {}

  @ApiOperation({ summary: 'Create a new slot', description: 'Only administrators can create new slots.' })
  @ApiResponse({ status: 201, description: 'The slot has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request / Validation failed.' })
  @ApiResponse({ status: 403, description: 'Forbidden. You do not have permission to perform this action.' })
  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateSlotDto) {
    return this.slotsService.create(dto);
  }

  @ApiOperation({ summary: 'Get all slots', description: 'All roles can retrieve a list of all registered slots.' })
  @ApiResponse({ status: 200, description: 'List of slots retrieved successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden. You do not have permission to perform this action.' })
  @Roles('ADMIN', RegisterableUserRole.MANAGER, RegisterableUserRole.STUDENT, RegisterableUserRole.LAB_ASSISTANT)
  @Get()
  findAll() 
  {
    return this.slotsService.findAll();
  }
  
  @ApiOperation({ summary: 'Get a slot by ID', description: 'All roles can retrieve details of a specific slot.' })
  @ApiResponse({ status: 200, description: 'Slot found successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden. You do not have permission to perform this action.' })
  @Roles('ADMIN', RegisterableUserRole.MANAGER, RegisterableUserRole.STUDENT, RegisterableUserRole.LAB_ASSISTANT)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) 
  {
    return this.slotsService.findOne(id);
  }

  @ApiOperation({ summary: 'Update a slot', description: 'Only administrators can update slot details.' })
  @ApiResponse({ status: 200, description: 'The slot has been successfully updated.' })
  @ApiResponse({ status: 400, description: 'Bad Request / Validation failed.' })
  @Roles('ADMIN')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSlotDto
  ) {
    return this.slotsService.update(id, dto);
  }

  @ApiOperation({ summary: 'Delete a slot', description: 'Only administrators can delete slots.' })
  @ApiResponse({ status: 200, description: 'The slot has been successfully deleted.' })
  @ApiResponse({ status: 403, description: 'Forbidden. You do not have permission to perform this action.' })
  @ApiResponse({ status: 404, description: 'Slot not found.' })
  @ApiResponse({ status: 409, description: 'Conflict. The slot cannot be deleted due to existing dependencies.' })
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.slotsService.remove(id);
  }
}
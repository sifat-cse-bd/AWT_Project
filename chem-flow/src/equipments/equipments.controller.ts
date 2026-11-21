import { Controller, Get, Post, Delete, Patch, Body, ParseIntPipe, Param} from '@nestjs/common';
import { EquipmentsService } from './equipments.service.js';
import { CreateEquipmentDto } from './dto/create-equipment.dto.js';
import { UpdateEquipmentDto } from './dto/update-equipment.dto.js';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { RegisterableUserRole } from '../users/dto/create-user.dto.js';


@ApiTags('equipments')
@Controller('equipments')
@ApiTags('equipments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('equipments')
export class EquipmentsController 
{
  constructor(private readonly equipmentsService: EquipmentsService) {}

  @ApiOperation({ summary: 'Create a new equipment', description: 'Only administrators and managers can create new equipments.' })
  @ApiResponse({ status: 201, description: 'The equipment has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request / Validation failed.' })
  @Roles('ADMIN', RegisterableUserRole.MANAGER)
  @Post('/create')
  create(@Body() dto: CreateEquipmentDto) 
  {
    return this.equipmentsService.CreateEquipment(dto);
  }

  @ApiOperation({ summary: 'Get all equipments', description: 'Only administrators, managers and lab assistants can retrieve a list of all registered equipments.' })
  @ApiResponse({ status: 200, description: 'List of equipments retrieved successfully.' })
  @Roles('ADMIN', RegisterableUserRole.MANAGER, RegisterableUserRole.LAB_ASSISTANT)
  @Get()
  findAllEQP() 
  {
    return this.equipmentsService.GetAllEquipments();
  }


  @ApiOperation({ summary: 'Check equipment availability', description: 'Only administrators, managers and lab assistants can check equipment availability with all attributes.' })
  @ApiResponse({ status: 200, description: 'Availability information retrieved successfully.' })
  @Roles('ADMIN', RegisterableUserRole.MANAGER, RegisterableUserRole.LAB_ASSISTANT)
  @Get('availability/:id/:requestedQTY')
  checkAvailability(@Param('id', ParseIntPipe) id: number, @Param('requestedQTY', ParseIntPipe) requestedQTY: number) 
  {
    return this.equipmentsService.CheckEQPAvailability(id, requestedQTY);
  }
  

  @ApiOperation({ summary: 'Get an equipment by ID', description: 'Only administrators, managers and lab assistants can retrieve equipment details.' })
  @ApiResponse({ status: 200, description: 'Equipment found successfully.' })
  @ApiResponse({ status: 404, description: 'Equipment not found.' })
  @Roles('ADMIN', RegisterableUserRole.MANAGER, RegisterableUserRole.LAB_ASSISTANT)
  @Get(':id')
  findOneEQP(@Param('id', ParseIntPipe) id: number) 
  {
    return this.equipmentsService.GetEquipmentById(id);
  }


  @ApiOperation({ summary: 'Update equipment details', description: 'Only administrators and managers can update equipment details.' })
  @ApiResponse({ status: 200, description: 'Equipment updated successfully.' })
  @ApiResponse({ status: 404, description: 'Equipment not found.' })
  @Roles('ADMIN', RegisterableUserRole.MANAGER)
  @Patch(':id')
  updateEQP(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEquipmentDto) 
  {
    return this.equipmentsService.UpdateEquipment(id, dto);
  }

  @ApiOperation({ summary: 'Delete an equipment', description: 'Only administrators and managers can delete equipments.' })
  @ApiResponse({ status: 200, description: 'Equipment deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Equipment not found.' })
  @Roles('ADMIN', RegisterableUserRole.MANAGER)
  @Delete(':id')
  deleteEQP(@Param('id', ParseIntPipe) id: number) 
  {
    return this.equipmentsService.DeleteEquipment(id);
  }

  

}

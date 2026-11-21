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
import { Equipment } from './entities/equipment.entity.js';


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
  
  @ApiOperation({ summary: 'Search equipments by name', description: 'Students may search equipments by name for booking purposes.' })
  @ApiResponse({ status: 200, description: 'Equipments matching the search criteria retrieved successfully.' })
  @Roles('ADMIN', RegisterableUserRole.MANAGER, RegisterableUserRole.LAB_ASSISTANT, RegisterableUserRole.STUDENT)
  @Get('search/:name')
  searchEquipments(@Param('name') name: string) 
  {
    return this.equipmentsService.SearchEquipmentsByName(name);
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

  @ApiOperation({ summary: 'Assign equipment to storage', description: 'Only administrators and managers can assign equipments to storage sections.' })
  @ApiResponse({ status: 200, description: 'Equipment assigned to storage successfully.' })
  @ApiResponse({ status: 404, description: 'Equipment or storage section not found.' })
  @ApiResponse({status: 403, description: 'Forbidden. Only administrators and managers can assign equipments to storage sections.'})
  @Roles('ADMIN', RegisterableUserRole.MANAGER)
  @Patch(':equipId/storage/:storeId')
  AssignEquipmentToStorage(
      @Param('equipId', ParseIntPipe) equipId: number,
      @Param('storeId', ParseIntPipe) storeId: number
    )
    {
      return this.equipmentsService.AssignEquipmentToStorage(equipId, storeId);
    }
    @ApiOperation({ summary: 'Get storages for an equipment', description: 'Only administrators, managers and lab assistants can retrieve the storage sections associated with a specific equipment.' })
    @ApiResponse({ status: 200, description: 'Storages for the equipment retrieved successfully.' })
    @ApiResponse({ status: 404, description: 'Equipment not found.' })
    @ApiResponse({status: 403, description: 'Forbidden. Only administrators, managers and lab assistants can retrieve the storage sections associated with a specific equipment.'})
    @Roles('ADMIN', RegisterableUserRole.MANAGER, RegisterableUserRole.LAB_ASSISTANT)  
    @Get(':equipId/storages')
    GetEquipmentStorages(
    @Param('equipId', ParseIntPipe) equipId: number) 
    {
        return this.equipmentsService.GetEquipmentStorages(equipId);
    }

    @ApiOperation({ summary: 'Remove equipment from storage', description: 'Only administrators and managers can remove equipments from storage sections.' })
    @ApiResponse({ status: 200, description: 'Equipment removed from storage successfully.' })
    @ApiResponse({ status: 404, description: 'Equipment or storage section not found.' })
    @ApiResponse({status: 403, description: 'Forbidden. Only administrators and managers can remove equipments from storage sections.'})
    @Roles('ADMIN', RegisterableUserRole.MANAGER)
    @Delete(':equipId/storage/:storeId')
    RemoveEquipmentFromStorage(
    @Param('equipId', ParseIntPipe) equipId: number,
    @Param('storeId', ParseIntPipe) storeId: number
    ){
        return this.equipmentsService.RemoveEquipmentFromStorage(equipId, storeId);
    }

    @Get('by-storage/:storeId')
    GetEquipmentsByStorage(
    @Param('storeId', ParseIntPipe) storeId: number) 
    {
        return this.equipmentsService.GetEquipmentsByStorage(storeId);
    }
}

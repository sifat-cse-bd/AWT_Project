import { Controller, Get, Post, Delete, Patch, Body, ParseIntPipe, Param} from '@nestjs/common';
import { EquipmentsService } from './equipments.service.js';
import { CreateEquipmentDto } from './dto/create-equipment.dto.js';
import { UpdateEquipmentDto } from './dto/update-equipment.dto.js';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import { EquipmentStatus } from './entities/equipment.entity.js';

@ApiTags('equipments')
@Controller('equipments')
export class EquipmentsController 
{
  constructor(private readonly equipmentsService: EquipmentsService) {}

  @ApiOperation({ summary: 'Create a new equipment', description: 'Registers a new equipment in the system with valid details.' })
  @ApiResponse({ status: 201, description: 'The equipment has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request / Validation failed.' })
  @Post('/create')
  create(@Body() dto: CreateEquipmentDto) 
  {
    return this.equipmentsService.CreateEquipment(dto);
  }

  @ApiOperation({ summary: 'Get all equipments', description: 'Retrieves a list of all registered equipments.' })
  @ApiResponse({ status: 200, description: 'List of equipments retrieved successfully.' })
  @Get()
  findAllEQP() 
  {
    return this.equipmentsService.GetAllEquipments();
  }

  @ApiOperation({ summary: 'Get equipments by status', description: 'Retrieves a list of equipments filtered by their status.' })
  @ApiResponse({ status: 200, description: 'List of equipments with the specified status retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'No equipments found with the specified status.' })
  @Get('status/:status')
  findByStatus(@Param('status') status: EquipmentStatus) 
  {
    return this.equipmentsService.FindByStatus(status);
  }

  @ApiOperation({ summary: 'Check equipment availability', description: 'Checks if an equipment is available for a requested quantity.' })
  @ApiResponse({ status: 200, description: 'Availability information retrieved successfully.' })
  @Get('availability/:id/:requestedQTY')
  checkAvailability(@Param('id', ParseIntPipe) id: number, @Param('requestedQTY', ParseIntPipe) requestedQTY: number) 
  {
    return this.equipmentsService.CheckEQPAvailability(id, requestedQTY);
  }
  

  @ApiOperation({ summary: 'Get an equipment by ID', description: 'Retrieval of a specific equipment using its unique ID.' })
  @ApiResponse({ status: 200, description: 'Equipment found successfully.' })
  @ApiResponse({ status: 404, description: 'Equipment not found.' })
  @Get(':id')
  findOneEQP(@Param('id', ParseIntPipe) id: number) 
  {
    return this.equipmentsService.GetEquipmentById(id);
  }


  @ApiOperation({ summary: 'Update equipment details', description: 'Updates specific fields of an existing equipment by ID.' })
  @ApiResponse({ status: 200, description: 'Equipment updated successfully.' })
  @ApiResponse({ status: 404, description: 'Equipment not found.' })
  @Patch(':id')
  updateEQP(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEquipmentDto) 
  {
    return this.equipmentsService.UpdateEquipment(id, dto);
  }

  @ApiOperation({ summary: 'Delete an equipment', description: 'Soft deletes an equipment from the system using its unique ID.' })
  @ApiResponse({ status: 200, description: 'Equipment deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Equipment not found.' })
  @Delete(':id')
  deleteEQP(@Param('id', ParseIntPipe) id: number) 
  {
    return this.equipmentsService.DeleteEquipment(id);
  }

  

}

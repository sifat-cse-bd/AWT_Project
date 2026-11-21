import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ChemicalsService } from './chemicals.service.js';
import { CreateChemicalDto } from './dtos/create-chemical.dto.js';
import { UpdateChemicalDto } from './dtos/update-chemical.dto.js';
import { ResponseDto } from './dtos/response.dto.js';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { RegisterableUserRole } from '../users/dto/create-user.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Chemical } from './entities/chemical.entity.js';
import { PaginationDto } from './dtos/pagination.dto.js';

@Controller('chemicals')
@ApiBearerAuth()//FOR AUTH---------------------------------------------------
/*
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RegisterableUserRole.insertHereAllowedRole)
*/ 
export class ChemicalsController {
  constructor(private readonly chemicalsService: ChemicalsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RegisterableUserRole.MANAGER)
  @Post('create')
  async createChemical(@Body() dto:CreateChemicalDto):Promise<Chemical>{
    return this.chemicalsService.createChemical(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RegisterableUserRole.MANAGER, RegisterableUserRole.STUDENT,RegisterableUserRole.LAB_ASSISTANT)
  @Get('list')
  async getChemicalsList(@Query() pagination:PaginationDto):Promise<Chemical[]>{
    return this.chemicalsService.getChemicalsList(pagination);
  }
  
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RegisterableUserRole.MANAGER, RegisterableUserRole.STUDENT,RegisterableUserRole.LAB_ASSISTANT)
  @Get('get/:id')
  async getChemicalById(@Param('id', ParseIntPipe) id:number):Promise<Chemical>{
    return this.chemicalsService.getChemicalById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RegisterableUserRole.MANAGER)
  @Patch('update/:id')
  async updateChemical(@Param('id', ParseIntPipe) id:number, @Body() dto:UpdateChemicalDto):Promise<Chemical>{
    return this.chemicalsService.updateChemical(id,dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RegisterableUserRole.MANAGER)
  @Delete('delete/:id')
  async deleteChemical(@Param('id', ParseIntPipe) id:number):Promise<ResponseDto>{
    return await this.chemicalsService.softDeleteChemical(id);
  }
  // @Get('low-stock')
  // async getLowStockList():Promise<CreateChemicalDto[]>{
  //   return await this.chemicalsService.getLowStockList();
  // }

  // @Post('deduct/:id/:amount')
  // async deductChemicalQty(@Param('id',ParseIntPipe) id:number, @Param('amount',ParseIntPipe) amount:number):Promise<CreateChemicalDto>{
  //   return await this.chemicalsService.deductChemicalQty(id,amount);
  // }
}

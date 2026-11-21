import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ChemicalsService } from './chemicals.service.js';
import { CreateChemicalDto } from './dtos/create-chemical.dto.js';
import { UpdateChemicalDto } from './dtos/update-chemical.dto.js';
import { ResponseDto } from './dtos/response.dto.js';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { RegisterableUserRole } from '../users/dto/create-user.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';

@Controller('chemicals')
@ApiBearerAuth()//FOR AUTH---------------------------------------------------
/*
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RegisterableUserRole.insertHereAllowedRole)
*/ 
export class ChemicalsController {
  constructor(private readonly chemicalsService: ChemicalsService) {}

  @Post('create')
  async createChemical(@Body() dto:CreateChemicalDto):Promise<CreateChemicalDto>{
    return await this.chemicalsService.createChemical(dto);
  }

  @Get('list')
  async getChemicalsList():Promise<CreateChemicalDto[]>{
    return await this.chemicalsService.getChemicalsList();
  }

  @Get('get/:id')
  async getChemicalById(@Param('id', ParseIntPipe) id:number):Promise<CreateChemicalDto>{
    return await this.chemicalsService.getChemicalById(id);
  }

  @Patch('update/:id')
  async updateChemical(@Param('id', ParseIntPipe) id:number, @Body() dto:CreateChemicalDto):Promise<UpdateChemicalDto>{
    return await this.chemicalsService.updateChemical(id,dto);
  }

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

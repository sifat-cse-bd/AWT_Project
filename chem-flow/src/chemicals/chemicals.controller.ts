import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ChemicalsService } from './chemicals.service.js';
import { CreateChemicalDto } from './dtos/create-chemical.dto.js';
import { UpdateChemicalDto } from './dtos/update-chemical.dto.js';
import { ResponseDto } from './dtos/response.dto.js';

@Controller('chemicals')
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

  @Get('low-stock')
  async getLowStockList():Promise<CreateChemicalDto[]>{
    return await this.chemicalsService.getLowStockList();
  }
}

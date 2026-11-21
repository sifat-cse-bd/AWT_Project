import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { StorageService } from './storage.service.js';
import { CreateStorageDto } from './dtos/create-storage.dto.js';
import { UpdateStorageDto } from './dtos/update-storage.dto.js';
import { ResponseDto } from './dtos/response.dto.js';
import { Storage } from './entities/storage.entity.js';
import { PaginationDto } from './dtos/pagination.dto.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { RegisterableUserRole } from '../users/dto/create-user.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RegisterableUserRole.MANAGER)
  @Post('create')
  createStorage(@Body() dto: CreateStorageDto): Promise<Storage> {
    return this.storageService.createStorage(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RegisterableUserRole.MANAGER,RegisterableUserRole.LAB_ASSISTANT)
  @Get('list')
  getStorageList(@Query() pagination:PaginationDto): Promise<Storage[]> {
    return this.storageService.getStorageList(pagination);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RegisterableUserRole.MANAGER,RegisterableUserRole.LAB_ASSISTANT)
  @Get('get/:id')
  getStorageById(@Param('id', ParseIntPipe) id: number): Promise<Storage> {
    return this.storageService.getStorageById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RegisterableUserRole.MANAGER)
  @Patch('update/:id')
  updateStorage(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStorageDto,
  ): Promise<Storage> {
    return this.storageService.updateStorage(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RegisterableUserRole.MANAGER)
  @Delete('delete/:id')
  deleteStorage(@Param('id', ParseIntPipe) id: number): Promise<ResponseDto> {
    return this.storageService.deleteStorage(id);
  }
}

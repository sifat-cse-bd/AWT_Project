import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { StorageService } from './storage.service.js';
import { CreateStorageDto } from './dtos/create-storage.dto.js';
import { UpdateStorageDto } from './dtos/update-storage.dto.js';
import { ResponseDto } from './dtos/response.dto.js';
import { Storage } from './entities/storage.entity.js';

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('create')
  createStorage(@Body() dto: CreateStorageDto): Promise<Storage> {
    return this.storageService.createStorage(dto);
  }

  @Get('list')
  getStorageList(): Promise<Storage[]> {
    return this.storageService.getStorageList();
  }

  @Get('get/:id')
  getStorageById(@Param('id', ParseIntPipe) id: number): Promise<Storage> {
    return this.storageService.getStorageById(id);
  }

  @Patch('update/:id')
  updateStorage(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStorageDto,
  ): Promise<Storage> {
    return this.storageService.updateStorage(id, dto);
  }

  @Delete('delete/:id')
  deleteStorage(@Param('id', ParseIntPipe) id: number): Promise<ResponseDto> {
    return this.storageService.deleteStorage(id);
  }
}

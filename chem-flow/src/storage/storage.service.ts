import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStorageDto } from './dtos/create-storage.dto.js';
import { UpdateStorageDto } from './dtos/update-storage.dto.js';
import { ResponseDto } from './dtos/response.dto.js';
import { Storage } from './entities/storage.entity.js';

@Injectable()
export class StorageService {
  constructor(
    @InjectRepository(Storage)
    private readonly storageRepo: Repository<Storage>,
  ) {}

  async createStorage(dto: CreateStorageDto): Promise<Storage> {
    const storage = this.storageRepo.create(dto);
    return this.storageRepo.save(storage);
  }

  async getStorageList(): Promise<Storage[]> {
    const storages = await this.storageRepo.find();
    if (storages.length === 0) {
      throw new NotFoundException('No storage locations found.');
    }
    return storages;
  }

  async getStorageById(id: number): Promise<Storage> {
    const storage = await this.storageRepo.findOne({ where: { storeId: id } });
    if (!storage) {
      throw new NotFoundException(`Storage location with ID ${id} not found.`);
    }
    return storage;
  }

  async updateStorage(id: number, dto: UpdateStorageDto): Promise<Storage> {
    const storage= await this.storageRepo.update(id,dto);
        if(!storage.affected){ throw new NotFoundException(`Storage with ID: ${id} not found`)}
        return this.getStorageById(id); //return updated values
  }

  async deleteStorage(id: number): Promise<ResponseDto> {
    const storage = await this.getStorageById(id);
    await this.storageRepo.remove(storage);
    return { message: `Storage location with ID ${id} has been removed.` };
  }
}

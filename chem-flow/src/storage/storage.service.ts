import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStorageDto } from './dtos/create-storage.dto.js';
import { UpdateStorageDto } from './dtos/update-storage.dto.js';
import { ResponseDto } from './dtos/response.dto.js';
import { Storage } from './entities/storage.entity.js';
import { PaginationDto } from './dtos/pagination.dto.js';
import { UsersService } from '../users/users.service.js';
import { RegisterableUserRole } from '../users/dto/create-user.dto.js';

@Injectable()
export class StorageService {
  constructor(
    @InjectRepository(Storage)
    private readonly storageRepo: Repository<Storage>,
    private readonly usersService: UsersService,
  ) { }

  async createStorage(dto: CreateStorageDto): Promise<Storage> {
    try {
      //Nahian
      const user = await this.usersService.findByUserId(dto.userId);
      if (!user) {
        throw new NotFoundException('User not found or inactive.');
      }
      if (user.role !== RegisterableUserRole.LAB_ASSISTANT) {
        throw new BadRequestException('Only lab assistants can be assigned to storage locations.');
      } //Nahian

      const storage = this.storageRepo.create(dto);

      storage.labAssistant = user; //Nahian

      return this.storageRepo.save(storage);
    } catch (error: any) {
      //Postrgres 23505->duplicate of unique fields violation: //409
      if (error.code === '23505') { throw new ConflictException(`Duplicate COnflict: Storage already exists.`) }
      //Postrgres 23514->db constraints violation. second protection after dto class: //400
      if (error.code === '23514') { throw new BadRequestException('Inputs violate database constraints.') }
      //for any other ones: //500 
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async getStorageList({page,limit}:PaginationDto): Promise<Storage[]> {
    const [storages,total] = await this.storageRepo.findAndCount();
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
 //Nahian
    if(dto.userId !== undefined)
      {
        const user = await this.usersService.findByUserId(dto.userId);
        if (!user) 
          {
            throw new NotFoundException('User not found or inactive.');
          }
        if (user.role !== RegisterableUserRole.LAB_ASSISTANT)
          {
            throw new BadRequestException('Only lab assistants can be assigned to storage locations.');
          }
      }//Nahian

    const storage = await this.storageRepo.update(id, dto);
    if (!storage.affected) { throw new NotFoundException(`Storage with ID: ${id} not found`) }
    return this.getStorageById(id); //return updated values
  }

  async deleteStorage(id: number): Promise<ResponseDto> {
    const storage = await this.getStorageById(id);
    await this.storageRepo.remove(storage);
    return { message: `Storage location with ID ${id} has been removed.` };
  }
}

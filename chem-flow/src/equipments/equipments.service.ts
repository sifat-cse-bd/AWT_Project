import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateEquipmentDto } from './dto/create-equipment.dto.js';
import { UpdateEquipmentDto } from './dto/update-equipment.dto.js';
import { Equipment } from './entities/equipment.entity.js';
import { Repository, ILike } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from '../users/users.service.js';
import { RegisterableUserRole } from '../users/dto/create-user.dto.js';
import { StorageService } from '../storage/storage.service.js';

@Injectable()
export class EquipmentsService 
{
  constructor(
    @InjectRepository(Equipment)
    private readonly equipmentRepo: Repository<Equipment>,
    private readonly usersService: UsersService,
    private readonly storageService: StorageService
  ) {}

  async CreateEquipment(CreateEQP: CreateEquipmentDto): Promise<Equipment>
  {
    const userEQP = await this.usersService.findByUserId(CreateEQP.userId);
    if(!userEQP)
      {
        throw new NotFoundException('User not found or inactive.');
      }

    if(userEQP.role !== RegisterableUserRole.LAB_ASSISTANT)
      {
        throw new BadRequestException('Only lab assistants can assigend as equipment observers.');
      }

    if (CreateEQP.availability > CreateEQP.totalQty) 
      {
        throw new BadRequestException('Available Quantity cannot exceed Total Quantity.');
      }
    const newEquipment = this.equipmentRepo.create(CreateEQP);
    newEquipment.labAssistant = userEQP;
    return await this.equipmentRepo.save(newEquipment);
  }

  async GetAllEquipments(): Promise<Equipment[]>
  {
    try
    {
      const equipments = await this.equipmentRepo.find
      (
        {
          select:
          {
            equipId: true,
            name: true,
            description: true,
            totalQty: true,
            availability: true,
            createdAt: true,
          },
          order: {createdAt: 'DESC'},
        }

      );

      if (equipments.length === 0)
      {
        throw new NotFoundException('No equipments found.');
      }

      return equipments;
        
      
    }
    catch (error)
    {
      throw error;
    }
  }

  async GetEquipmentById(id: number)
  {
    try
    {
       const equipment = await this.equipmentRepo.findOne
       (
        { 
          where: { equipId: id },
          select:
          {
            equipId: true,
            name: true,
            description: true,
            totalQty: true,
            availability: true,
            createdAt: true,
          }
        }

       );
      if (!equipment) 
        {
          throw new NotFoundException('Equipment not found.');
        }
        return equipment;
    }
    catch (error)
    {
      throw error;
    }
    
  }

  async SearchEquipmentsByName(name: string)
  {
    if(!name.trim())
      {
        throw new BadRequestException('Equipment name is required for search.');
      }

      const equipments = await this.equipmentRepo.find
      (
        {
          where: { name: ILike(`%${name}%`) },
          select:
          {
            name: true,
            description: true,
            totalQty: true,
          }
        }
      );
      return equipments;
  }

  async UpdateEquipment(id: number, updateEQP: UpdateEquipmentDto): Promise<Equipment>
  {
    const equipment = await this.GetEquipmentById(id);

    const totalQty = updateEQP.totalQty ?? equipment.totalQty;
    const availability = updateEQP.availability ?? equipment.availability;

    if(availability > totalQty)
      {
        throw new BadRequestException('Available Quantity cannot exceed Total Quantity.');
      }

    if(updateEQP.userId !== undefined)
      {
        const userEQP = await this.usersService.findByUserId(updateEQP.userId);
        if(!userEQP)
          {
            throw new NotFoundException('User not found or inactive.');
          }
        if(userEQP.role !== RegisterableUserRole.LAB_ASSISTANT)
          {
            throw new BadRequestException('Only lab assistants can be assigned as equipment observers.');
          }
        equipment.labAssistant = userEQP;
      }

    Object.assign(equipment, updateEQP);
    return await this.equipmentRepo.save(equipment);
  }


  async CheckEQPAvailability(id: number, requestedQTY: number)
  {
    const equipment = await this.GetEquipmentById(id);

    if(requestedQTY < 1)
      {
        throw new BadRequestException('Requested quantity must be at least 1.');
      }  
    
    if(equipment.availability >= requestedQTY)
      {
        return `Equipment with ID ${id} is available for the requested quantity of ${requestedQTY}.`;
      }
    
    return `Equipment with ID ${id} is not available for now.`;
  }

  async DeleteEquipment (id: number): Promise<string>
    {
      const equipment = await this.GetEquipmentById(id);
      
      await this.equipmentRepo.softRemove(equipment);

      return `Equipment with ID ${id} deleted successfully.`
    }
    
  async AssignEquipmentToStorage(equipId: number, storeId: number): Promise<Equipment>
  {
      const equipment = await this.equipmentRepo.findOne({
          where: { equipId },
          relations: { storages: true }
      });

      if (!equipment) {
          throw new NotFoundException('Equipment not found.');
      }

      const storage = await this.storageService.getStorageById(storeId);

      if (equipment.storages.some(s => s.storeId === storeId)) {
          throw new ConflictException(
              'Equipment is already assigned to this storage.'
          );
      }

      equipment.storages.push(storage);

      return await this.equipmentRepo.save(equipment);
  }


}

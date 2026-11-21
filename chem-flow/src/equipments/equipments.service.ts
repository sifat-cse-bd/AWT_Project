import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateEquipmentDto } from './dto/create-equipment.dto.js';
import { UpdateEquipmentDto } from './dto/update-equipment.dto.js';
import { Equipment } from './entities/equipment.entity.js';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from '../users/users.service.js';

@Injectable()
export class EquipmentsService 
{
  constructor(
    @InjectRepository(Equipment)
    private readonly equipmentRepo: Repository<Equipment>,
    private readonly usersService: UsersService
  ) {}

  async CreateEquipment(CreateEQP: CreateEquipmentDto): Promise<Equipment>
  {
    if (CreateEQP.availability > CreateEQP.totalQty) 
      {
        throw new BadRequestException('Available Quantity cannot exceed Total Quantity.');
      }
    const newEquipment = this.equipmentRepo.create(CreateEQP);
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

  async UpdateEquipment(id: number, updateEQP: UpdateEquipmentDto): Promise<Equipment>
  {
    const equipment = await this.GetEquipmentById(id);

    const totalQty = updateEQP.totalQty ?? equipment.totalQty;
    const availability = updateEQP.availability ?? equipment.availability;

    if(availability > totalQty)
      {
        throw new BadRequestException('Available Quantity cannot exceed Total Quantity.');
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
    
  


}

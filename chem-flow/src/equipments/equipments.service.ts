import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateEquipmentDto } from './dto/create-equipment.dto.js';
import { UpdateEquipmentDto } from './dto/update-equipment.dto.js';
import { Equipment, EquipmentStatus } from './entities/equipment.entity.js';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class EquipmentsService 
{
  constructor(
    @InjectRepository(Equipment)
    private readonly equipmentRepo: Repository<Equipment>,
  ) {}

  async CreateEquipment(CreateEQP: CreateEquipmentDto): Promise<Equipment>
  {
    if (CreateEQP.availableQty > CreateEQP.totalQty) 
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
            id: true,
            name: true,
            totalQty: true,
            availableQty: true,
            status: true,
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
          where: { id },
          select:
          {
            id: true,
            name: true,
            totalQty: true,
            availableQty: true,
            status: true,
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

  async FindByStatus(status: EquipmentStatus): Promise<Equipment[]>
  {
    const equipments = await this.equipmentRepo.find({ where: { status } });
    if (!equipments || equipments.length === 0)
      {
        throw new NotFoundException(`No equipments found with status: ${status}`);
      }
    return equipments;
  }

  async UpdateEquipment(id: number, updateEQP: UpdateEquipmentDto): Promise<Equipment>
  {
    const equipment = await this.GetEquipmentById(id);

    const totalQty = updateEQP.totalQty ?? equipment.totalQty;
    const availableQty = updateEQP.availableQty ?? equipment.availableQty;

    if(availableQty > totalQty)
      {
        throw new BadRequestException('Available Quantity cannot exceed Total Quantity.');
      }

    Object.assign(equipment, updateEQP);
    return await this.equipmentRepo.save(equipment);
  }

  async DeleteEquipment (id: number): Promise<string>
    {
      const equipment = await this.GetEquipmentById(id);
      
      await this.equipmentRepo.softRemove(equipment);

      return `Equipment with ID ${id} deleted successfully.`
    }
    
  


}

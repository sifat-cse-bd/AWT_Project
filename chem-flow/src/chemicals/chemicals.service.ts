import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chemical } from './entities/chemical.entity.js';
import { Repository } from 'typeorm';
import { Storage } from '../storage/entities/storage.entity.js';
import { CreateChemicalDto } from './dtos/create-chemical.dto.js';
import { UpdateChemicalDto } from './dtos/update-chemical.dto.js';
import { ResponseDto } from './dtos/response.dto.js';

@Injectable()
export class ChemicalsService {
    constructor(
        @InjectRepository(Chemical) private readonly chemicalRepo: Repository<Chemical>,
        @InjectRepository(Storage) private readonly storageRepo: Repository<Storage>,
    ) {}

    //create, read (list, by id), update, delete & correct HTTP status codes

    //create
    async createChemical(dto:CreateChemicalDto):Promise<Chemical>{
        const currentDate = new Date().toISOString().slice(0, 10);
        if (dto.expiryDate < currentDate) {
            throw new BadRequestException('Please ensure expiry date is not in the past');
        }

        const storage = await this.storageRepo.findOne({ where: { storeId: dto.storeId } });
        if (!storage) {
            throw new NotFoundException(`Storage location with ID ${dto.storeId} not found`);
        }

        try{
            const { storeId, ...chemicalFields } = dto;
            const newChemical = this.chemicalRepo.create({ ...chemicalFields, storage });
            return await this.chemicalRepo.save(newChemical);

        }catch(error:any){
            //Postrgres 23505->duplicate of unique fields violation: //409
            if(error.code==='23505'){throw new ConflictException(`Duplicate COnflict: Chemical already exists.`)}
            //Postrgres 23514->db constraints violation. second protection after dto class: //400
            if(error.code==='23514'){throw new BadRequestException('Inputs violate database constraints.')}
            //for any other ones: //500 
            throw new InternalServerErrorException('Internal server error'); 
        }
    }

    //read list
    async getChemicalsList():Promise<Chemical[]>{
        const list = await this.chemicalRepo.find({
            relations: { storage: true },
            order: { chemId: 'ASC' },
        });
        if(list.length===0){throw new NotFoundException('List is empty')}//404
        return list;
    }

    //read one
    async getChemicalById(id:number):Promise<Chemical>{
        const chemical = await this.chemicalRepo.findOne({
            where:{chemId:id},
            relations: { storage: true },
        });
        if(chemical===null){throw new NotFoundException(`Chemical with ID: ${id} not found`);} //404
        return chemical;
    }

    //update
    async updateChemical(id:number, dto:UpdateChemicalDto):Promise<Chemical>{
        const chemical = await this.getChemicalById(id);
        if (dto.expiryDate !== undefined) {
            const currentDate = new Date().toISOString().slice(0, 10);
            if (dto.expiryDate < currentDate) {
                throw new BadRequestException('Please ensure expiry date is not in the past');
            }
        }

        const { storeId, ...chemicalFields } = dto;
        Object.assign(chemical, chemicalFields);
        if (storeId !== undefined) {
            const storage = await this.storageRepo.findOne({ where: { storeId } });
            if (!storage) {
                throw new NotFoundException(`Storage location with ID ${storeId} not found`);
            }
            chemical.storage = storage;
        }
        return this.chemicalRepo.save(chemical);
    }

    //delete (always soft delete for compliance and logs)
    async softDeleteChemical(id:number):Promise<ResponseDto>{
        const chemical = await this.chemicalRepo.softDelete(id);
        if(!chemical.affected){throw new NotFoundException(`Chemical with ID: ${id} not found`);}
        return {message: `Chemical with ID:${id} has been removed`}
    }

    // //get all chemicals with low stock 
    // async getLowStockList():Promise<CreateChemicalDto[]>{
    //     return this.ChemicalRepo
    //     .createQueryBuilder('chemical')
    //     .select(['chemical.id', 'chemical.name','chemical.currentQty', 'chemical.unit','chemical.hazardLevel'])
    //     .where('chemical.currentQty <=chemical.minStockQty')
    //     .orderBy('chemical.currentQty','ASC') //so chemicals requiring immediate restocking is at top of results
    //     .getMany();
    // }

    // //deduct used chemical amount (future iteration:trigger mailtrap alert if stock not available, for now just throw excep.)
    // async deductChemicalQty(id:number, amount:number):Promise<CreateChemicalDto>{
    //     if(amount<=0){throw new BadRequestException('Amount must be a positive value.');}
    //     const chemical= await this.getChemicalById(id);
    //     const updated = await this.ChemicalRepo
    //         .createQueryBuilder()
    //         .update(Chemical)
    //         .set({currentQty:()=>`"currentQty"-:amount`})
    //         .where('id=:id',{id}) //parameterization
    //         .andWhere('"currentQty">=:amount',{amount})
    //         .execute();

    //         if(!updated.affected){throw new BadRequestException('Enough stock not available for allocation. Restock.');}
    //         return chemical;
    // }
}

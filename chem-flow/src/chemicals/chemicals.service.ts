import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chemical } from './entities/chemical.entity.js';
import { Raw, Repository } from 'typeorm';
import { CreateChemicalDto } from './dtos/create-chemical.dto.js';
import { UpdateChemicalDto } from './dtos/update-chemical.dto.js';
import { ResponseDto } from './dtos/response.dto.js';

@Injectable()
export class ChemicalsService {
    constructor(@InjectRepository(Chemical) private readonly ChemicalRepo: Repository<Chemical>){}

    //create, read (list, by id), update, delete & correct HTTP status codes

    //create
    async createChemical(dto:CreateChemicalDto):Promise<CreateChemicalDto>{
        //toLocaleDateString('en-CA') gives YYYY-MM-DD format of Canada
        const currentDate= new Date().toLocaleDateString('en-CA');

        if(dto.expiryDate<currentDate){throw new BadRequestException('Please ensure expiry date is not in the past');}
        try{
            const newChemical= await this.ChemicalRepo.create(dto);
            return await this.ChemicalRepo.save(newChemical); //201

        }catch(error:any){
            //Postrgres 23505->duplicate of unique fields violation: //409
            if(error.code==='23505'){throw new ConflictException(`Duplicate COnflict: Chemical with ID: ${dto.chemicalId} already exists.`)}
            //Postrgres 23514->db constraints violation. second protection after dto class: //400
            if(error.code==='23514'){throw new BadRequestException('Inputs violate database constraints.')}
            //for any other ones: //500 
            throw new InternalServerErrorException('Internal server error'); 
        }
    }

    //read list
    async getChemicalsList():Promise<CreateChemicalDto[]>{
        const list= await this.ChemicalRepo.find({
            select:{
                id:true,
                name:true,
                currentQty:true,
                unit:true,
                hazardLevel:true
            }
        })
        if(list.length===0){throw new NotFoundException('List is empty')}//404
        return list;
    }

    //read one
    async getChemicalById(id:number):Promise<CreateChemicalDto>{
        const chemical= await this.ChemicalRepo.findOne({
            where:{id:id},
            select:{id:true, name:true, currentQty:true, unit:true, hazardLevel:true}
        });
        if(chemical===null){throw new NotFoundException(`Chemical with ID: ${id} not found`);} //404
        return chemical;
    }

    //update
    async updateChemical(id:number, dto:UpdateChemicalDto):Promise<UpdateChemicalDto>{
        const chemical= await this.ChemicalRepo.update(id,dto);
        if(!chemical.affected){ throw new NotFoundException(`Chemical with ID: ${id} not found`)}
        return this.getChemicalById(id); //return updated values
    }

    //delete (always soft delete for compliance and logs)
    async softDeleteChemical(id:number):Promise<ResponseDto>{
        const chemical= await this.ChemicalRepo.delete(id);
        if(!chemical.affected){throw new NotFoundException(`Chemical with ID: ${id} not found`);}
        return {message: `Chemical with ID:${id} has been removed`}
    }

    //get all chemicals with low stock 
    async getLowStockList():Promise<CreateChemicalDto[]>{
        return this.ChemicalRepo
        .createQueryBuilder('chemical')
        .select(['chemical.id', 'chemical.name','chemical.currentQty', 'chemical.unit','chemical.hazardLevel'])
        .where('chemical.currentQty <=chemical.minStockQty')
        .orderBy('chemical.currentQty','ASC') //so chemicals requiring immediate restocking is at top of results
        .getMany();
    }

    //deduct used chemical amount (future iteration:trigger mailtrap alert if stock not available, for now just throw excep.)
    async deductChemicalQty(id:number, amount:number):Promise<CreateChemicalDto>{
        if(amount<=0){throw new BadRequestException('Amount must be a positive value.');}
        const chemical= await this.getChemicalById(id);
        const updated = await this.ChemicalRepo
            .createQueryBuilder()
            .update(Chemical)
            .set({currentQty:()=>`"currentQty"-:amount`})
            .where('id=:id',{id}) //parameterization
            .andWhere('"currentQty">=:amount',{amount})
            .execute();

            if(!updated.affected){throw new BadRequestException('Enough stock not available for allocation. Restock.');}
            return chemical;
    }
}

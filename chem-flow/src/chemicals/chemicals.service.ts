import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chemical } from './entities/chemical.entity.js';
import { Repository } from 'typeorm';
import { CreateChemicalDto } from './dtos/create-chemical.dto.js';
import { UpdateChemicalDto } from './dtos/update-chemical.dto.js';

@Injectable()
export class ChemicalsService {
    constructor(@InjectRepository(Chemical) private readonly ChemicalRepo: Repository<Chemical>){}

    //create, read (list, by id), update, delete & correct HTTP status codes

    //create
    async createChemical(dto:CreateChemicalDto):Promise<Chemical>{
        //toLocaleDateString('en-CA') gives YYYY-MM-DD format of Canada
        const currentDate= new Date().toLocaleDateString('en-CA');

        if(dto.expiryDate<currentDate){throw new BadRequestException('Please ensure expiry date is not in the past');}
        try{
            const newChemical= await this.ChemicalRepo.create(dto);
            return await this.ChemicalRepo.save(newChemical); //201

        }catch(error:any){
            //Postrgres 23505->duplicate of unique fields violation: //409
            if(error.code==='23505'){throw new ConflictException(`Duplicate COnflict: Chemical with ID: ${dto.id} already exists.`)}
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
}

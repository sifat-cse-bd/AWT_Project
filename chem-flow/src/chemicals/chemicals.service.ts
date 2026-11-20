import { BadRequestException, ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chemical } from './entities/chemical.entity.js';
import { Repository } from 'typeorm';
import { CreateChemicalDto } from './dtos/create-chemical.dto.js';

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
}

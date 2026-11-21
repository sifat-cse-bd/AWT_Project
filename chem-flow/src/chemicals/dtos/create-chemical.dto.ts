import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsDateString, IsEnum, IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, Min } from "class-validator";
import{Type} from 'class-transformer';
import { HazardLevel } from "../entities/chemical.entity.js";

export class CreateChemicalDto{
    @IsString()
    @IsNotEmpty()
    @ApiProperty({description:'Chemical name',example:'Ethanol'})
    name:string;

    @IsString()
    @IsOptional()
    @ApiProperty({description: 'Chemical description',example: 'Flammable solvent', required:false,nullable:true})
    description?:string |null;

    @IsNotEmpty({message:'Please specify chemical hazard level for compliance'})
    @IsEnum(HazardLevel)
    @ApiProperty({description:'Chemical Safety Level.',example:'LOW',})
    hazardLevel:HazardLevel;

    // @IsNumber()
    // @Type(()=>Number)
    // @Min(0.1, {message:'Minimum quantity should be 0.1 of any unit'})
    // @ApiProperty({
    //     description:'Current quantity of this chemical',
    //     example:'10'
    // })
    // currentQty:number;

    // @IsNumber()
    // @Type(()=>Number)
    // @ApiProperty({description:'Minimum quantity in stock before alerting',example:'10'})
    // minStockQty:number;

    // @IsString()
    // @IsNotEmpty()
    // @ApiProperty({description:'Unit of chemical quantity',example:'mL'})
    // unit:string;

    @IsDateString()
    @IsNotEmpty({message:'Please specify expiry date for compliance'})
    @IsOptional()
    @ApiProperty({
        description:'Expiry Date (ISO 8601 Format: YYYY-MM-DD)',
        example:'2027-11-28',
        required:true
    })
    @Matches(/^\d{4}-\d{2}-\d{2}$/, {message:'Expiry date must follow YYYY-MM-DD format'})
    expiryDate:string;

    @IsBoolean()
    @ApiProperty({
        description:'Whether the chemical is currently available',
        example:true,
        default:true
    })
    availability:boolean;

    // @IsOptional()
    // @IsInt()
    // @ApiProperty({
    //     description:'Whether the chemical is currently booked',
    //     example:'1',
    //     required:false,
    //     nullable:true
    // })
    // bookingId?:number|null;

    // @IsOptional()
    // @IsInt()
    // @ApiProperty({
    //     description:'userId of Lab Assistant responsible for this chemical',
    //     example:'LAB-001',
    //     required:false,
    //     nullable:true
    // })
    // userId?:number|null;
}
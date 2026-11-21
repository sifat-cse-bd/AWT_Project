import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsString, Matches, Min } from "class-validator";
import{Type} from 'class-transformer';

export enum HazardLevel{
    //Chemical Safety Levels (CSL): 1 (Minimal) 2(Low) 3(Moderate) 4(High)
    MINIMAL=1,
    LOW=2,
    MODERATE=3,
    HIGH=4
 }

export class CreateChemicalDto{

    @IsNumber()
    @Type(()=>Number)
    @IsNotEmpty()
    @ApiProperty({
        description:'Unique chemical ID',
    })
    id:number;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description:'Chemical name',
        example:'Sulfuric Acid'
    })
    name:string;

    @IsNotEmpty({message:'Please specify chemical hazard level for compliance'})
    @IsEnum(HazardLevel)
    @ApiProperty({
        description:'Chemical Safety Level (CSL). 1 for Minimal, 2 for Low, 3 for Moderate, 4 for High',
        example:'1'
    })
    hazardLevel:HazardLevel;

    @IsNumber()
    @Type(()=>Number)
    @Min(0.1, {message:'Minimum quantity should be 0.1 of any unit'})
    @ApiProperty({
        description:'Current quantity of this chemical',
        example:'10'
    })
    currentQty:number;

    @IsNumber()
    @Type(()=>Number)
    @ApiProperty({
        description:'Minimum quantity in stock before alerting',
        example:'10'
    })
    minStockQty:number;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description:'Unit of chemical quantity',
        example:'mL'
    })
    unit:string;

    @IsDateString()
    @IsNotEmpty({message:'Please specify expiry date for compliance'})
    @ApiProperty({
        description:'Expiry Date (Date Only Format: YYYY-MM-DD)',
        format:'date',
        example:'2027-11-28'
    })
    @Matches(/^\d{4}-\d{2}-\d{2}$/, {message:'Expiry date must follow YYYY-MM-DD format'})
    expiryDate:string;
}
import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsPositive, IsString } from "class-validator";

export class CreateStorageDto{

    @IsString()
    @ApiProperty({
        description:'Storage section',
        example: 'sec-A'
    })
    section:string;

    @IsString()
    @ApiProperty({
        description:'Storage Shelf',
        example: 'shelf-1'
    })
    shelf:string;
    //Nahian
    @ApiProperty
    ({
        description: 'Lab Assistant ID assigned to this storage',
        example: 'LAS-001'
    })
    @IsString()
    @IsNotEmpty()
    userId: string;
    //Nahian
}
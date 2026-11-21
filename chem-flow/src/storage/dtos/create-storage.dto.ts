import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsPositive, IsString } from "class-validator";

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
}
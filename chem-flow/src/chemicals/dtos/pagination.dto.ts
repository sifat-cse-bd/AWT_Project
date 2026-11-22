import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, Max, Min } from "class-validator";

export class PaginationDto{

    @ApiPropertyOptional({ example: 1, description: 'Page number' })
    @IsOptional()
    @Type(()=>Number)
    @IsInt()
    @Min(1)
    page?=1;

    @ApiPropertyOptional({ example: 1, description: 'Items to show per page' })
    @IsOptional()
    @Type(()=>Number)
    @IsInt()
    @Min(1)
    @Max(50)
    limit?=2;
}
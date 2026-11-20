import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class ResponseDto{
    @ApiProperty({
        example: "Operation executed successfully"
    })
    @IsString()
    message: string;
}
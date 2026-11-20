import { ApiProperty } from "@nestjs/swagger";

export class ResponseDto{
    @ApiProperty({
        example: "Operation executed successfully"
    })
    message: string;
}
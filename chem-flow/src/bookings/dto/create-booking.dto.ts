import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsNotEmpty, IsString, MaxLength } from "class-validator";  

export class CreateBookingDto {
    @ApiProperty({ example: 'STD-001', description: 'Requester user ID; authentication will provide this after login is implemented.' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(32)
    requesterUserId: string;

    @ApiProperty({ example: 'Chemistry lab experiment(Name of the experiments)' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(500)
    purpose: string; //purpose means the reason for booking the lab.

    @ApiProperty({ example: '2026-12-01T09:00:00.000Z' })
    @IsDateString()
    startAt: string;

    @ApiProperty({ example: '2026-12-01T11:00:00.000Z' })
    @IsDateString()
    endAt: string;
}
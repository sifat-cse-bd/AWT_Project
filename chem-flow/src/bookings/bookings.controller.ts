import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
} from '@nestjs/common';
import { BookingsService } from './bookings.service.js';
import { CreateBookingDto } from './dto/create-booking.dto.js';
import { UpdateBookingDto } from './dto/update-booking.dto.js';

@Controller('bookings')
export class BookingsController {
    constructor(private readonly bookingsService: BookingsService) {}

    @Post()
    create(@Body() dto: CreateBookingDto) {
        return this.bookingsService.create(dto);
    }

    @Get()
    findAll() {
        return this.bookingsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.bookingsService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateBookingDto,
    ) {
        return this.bookingsService.update(id, dto);
    }

    @Patch(':id/cancel')
    cancel(@Param('id', ParseIntPipe) id: number) {
        return this.bookingsService.cancel(id);
    }
}

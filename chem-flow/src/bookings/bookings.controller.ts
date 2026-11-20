import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BookingsService } from './bookings.service.js';
import { CreateBookingDto } from './dto/create-booking.dto.js';
import { UpdateBookingDto } from './dto/update-booking.dto.js';

@ApiTags('bookings')
@Controller('bookings')
export class BookingsController {
    constructor(private readonly bookingsService: BookingsService) {}

    @Post()
    @ApiOperation({ summary: 'Create a booking request' })
    @ApiResponse({ status: 201, description: 'Booking request created.' })
    create(@Body() dto: CreateBookingDto) {
        return this.bookingsService.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'List booking requests' })
    findAll() {
        return this.bookingsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a booking request' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.bookingsService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a pending booking request' })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateBookingDto,
    ) {
        return this.bookingsService.update(id, dto);
    }

    @Patch(':id/cancel')
    @ApiOperation({ summary: 'Cancel a pending booking request' })
    cancel(@Param('id', ParseIntPipe) id: number) {
        return this.bookingsService.cancel(id);
    }
}

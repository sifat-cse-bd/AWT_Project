import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import type { AuthUser } from '../auth/auth-user.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { RegisterableUserRole } from '../users/dto/create-user.dto.js';
import { BookingsService } from './bookings.service.js';
import { CreateBookingDto } from './dto/create-booking.dto.js';
import { UpdateBookingDto } from './dto/update-booking.dto.js';

@ApiTags('bookings')
@ApiBearerAuth()
@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
    constructor(private readonly bookingsService: BookingsService) {}

    @Post()
    @UseGuards(RolesGuard)
    @Roles(RegisterableUserRole.STUDENT)
    @ApiOperation({
        summary: 'Request a group booking',
        description: 'An authenticated STUDENT who belongs to the group may submit one booking request for it.',
    })
    @ApiResponse({ status: 201, description: 'Booking request created.' })
    @ApiResponse({ status: 401, description: 'Authentication required.' })
    @ApiResponse({ status: 403, description: 'Only a group member with the STUDENT role may create a booking.' })
    @ApiResponse({ status: 404, description: 'Group not found.' })
    @ApiResponse({ status: 409, description: 'The group already has a booking request.' })
    create(@Body() dto: CreateBookingDto, @Req() request: { user: AuthUser }) {
        return this.bookingsService.create(dto, request.user);
    }

    @Get()
    @ApiOperation({
        summary: 'List visible bookings',
        description: 'MANAGER and ADMIN see all requests; other users see requests for groups they belong to.',
    })
    @ApiResponse({ status: 200, description: 'Booking requests returned.' })
    findAll(@Req() request: { user: AuthUser }) {
        return this.bookingsService.findAll(request.user);
    }

    @Get(':bookingId')
    @ApiOperation({
        summary: 'Get booking details',
        description: 'Visible to group members, MANAGER, and ADMIN.',
    })
    @ApiParam({ name: 'bookingId', description: 'Generated numeric booking primary key.' })
    @ApiResponse({ status: 403, description: 'Only group members, MANAGER, or ADMIN may view this request.' })
    @ApiResponse({ status: 404, description: 'Booking not found.' })
    findOne(
        @Param('bookingId', ParseIntPipe) bookingId: number,
        @Req() request: { user: AuthUser },
    ) {
        return this.bookingsService.findOne(bookingId, request.user);
    }

    @Patch(':bookingId')
    @ApiOperation({
        summary: 'Update booking title',
        description: 'A group member may update the title before manager approval; ADMIN may manage any booking.',
    })
    @ApiParam({ name: 'bookingId', description: 'Generated numeric booking primary key.' })
    @ApiResponse({ status: 403, description: 'Not allowed to manage this booking.' })
    @ApiResponse({ status: 404, description: 'Booking not found.' })
    @ApiResponse({ status: 409, description: 'Cancelled bookings cannot be changed.' })
    update(
        @Param('bookingId', ParseIntPipe) bookingId: number,
        @Body() dto: UpdateBookingDto,
        @Req() request: { user: AuthUser },
    ) {
        return this.bookingsService.update(bookingId, dto, request.user);
    }

    @Patch(':bookingId/cancel')
    @ApiOperation({
        summary: 'Cancel a booking request',
        description: 'A group member may cancel before approval; ADMIN may cancel any uncancelled request.',
    })
    @ApiParam({ name: 'bookingId', description: 'Generated numeric booking primary key.' })
    @ApiResponse({ status: 200, description: 'Booking cancellation timestamp saved.' })
    @ApiResponse({ status: 403, description: 'Not allowed to cancel this booking.' })
    @ApiResponse({ status: 404, description: 'Booking not found.' })
    @ApiResponse({ status: 409, description: 'Cancelled bookings cannot be changed.' })
    cancel(
        @Param('bookingId', ParseIntPipe) bookingId: number,
        @Req() request: { user: AuthUser },
    ) {
        return this.bookingsService.cancel(bookingId, request.user);
    }

    @Post(':bookingId/approve')
    @UseGuards(RolesGuard)
    @Roles(RegisterableUserRole.MANAGER)
    @ApiOperation({
        summary: 'Approve a booking request',
        description: 'An authenticated MANAGER approves an uncancelled request by assigning their userId.',
    })
    @ApiParam({ name: 'bookingId', description: 'Generated numeric booking primary key.' })
    @ApiResponse({ status: 201, description: 'Booking approved and manager assigned.' })
    @ApiResponse({ status: 403, description: 'Only MANAGER users can approve bookings; ADMIN cannot approve.' })
    @ApiResponse({ status: 404, description: 'Booking not found.' })
    @ApiResponse({ status: 409, description: 'The request is cancelled or already approved.' })
    approve(
        @Param('bookingId', ParseIntPipe) bookingId: number,
        @Req() request: { user: AuthUser },
    ) {
        return this.bookingsService.approve(bookingId, request.user);
    }
}

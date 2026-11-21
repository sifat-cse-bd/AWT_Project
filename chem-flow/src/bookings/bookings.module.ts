import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service.js';
import { BookingsController } from './bookings.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity.js';
import { User } from '../users/entities/user.entity.js';
import { Group } from '../groups/entities/group.entity.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, User, Group])],
  controllers: [BookingsController],
  providers: [BookingsService, JwtAuthGuard, RolesGuard],
})
export class BookingsModule {}

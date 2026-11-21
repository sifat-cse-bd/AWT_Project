import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from '../bookings/entities/booking.entity.js';
import { Admin } from '../admin/entities/admin.entity.js';
import { Slot } from './entities/slot.entity.js';
import { SlotsController } from './slots.controller.js';
import { SlotsService } from './slots.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Slot, Booking, Admin])],
  controllers: [SlotsController],
  providers: [SlotsService],
  exports: [SlotsService],
})
export class SlotsModule {}

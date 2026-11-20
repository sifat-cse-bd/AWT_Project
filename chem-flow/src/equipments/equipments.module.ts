import { Module } from '@nestjs/common';
import { EquipmentsService } from './equipments.service.js';
import { EquipmentsController } from './equipments.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Equipment } from './entities/equipment.entity.js'; 
@Module({
  imports: [TypeOrmModule.forFeature([Equipment])],
  controllers: [EquipmentsController],
  providers: [EquipmentsService],
})
export class EquipmentsModule {}

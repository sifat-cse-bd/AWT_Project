import { Module } from '@nestjs/common';
import { EquipmentsService } from './equipments.service.js';
import { EquipmentsController } from './equipments.controller.js';

@Module({
  controllers: [EquipmentsController],
  providers: [EquipmentsService],
})
export class EquipmentsModule {}

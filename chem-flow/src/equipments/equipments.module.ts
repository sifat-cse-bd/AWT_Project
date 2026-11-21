import { Module } from '@nestjs/common';
import { EquipmentsService } from './equipments.service.js';
import { EquipmentsController } from './equipments.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Equipment } from './entities/equipment.entity.js'; 
import {UsersModule} from '../users/users.module.js';
import { StorageModule } from '../storage/storage.module.js';
@Module({
  imports: [TypeOrmModule.forFeature([Equipment]), UsersModule, StorageModule],
  controllers: [EquipmentsController],
  providers: [EquipmentsService],
})
export class EquipmentsModule {}

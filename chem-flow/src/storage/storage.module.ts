import { Module } from '@nestjs/common';
import { StorageService } from './storage.service.js';
import { StorageController } from './storage.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Storage } from './entities/storage.entity.js';
import { UsersModule } from '../users/users.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Storage]), UsersModule],
  controllers: [StorageController],
  providers: [StorageService],
  exports: [StorageService], 
})
export class StorageModule {}

import { Module } from '@nestjs/common';
import { ChemicalsService } from './chemicals.service.js';
import { ChemicalsController } from './chemicals.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chemical } from './entities/chemical.entity.js';

@Module({
  imports:[TypeOrmModule.forFeature([Chemical])],
  controllers: [ChemicalsController],
  providers: [ChemicalsService],
})
export class ChemicalsModule {}

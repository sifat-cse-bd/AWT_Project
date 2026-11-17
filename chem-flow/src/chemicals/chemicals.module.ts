import { Module } from '@nestjs/common';
import { ChemicalsService } from './chemicals.service.js';
import { ChemicalsController } from './chemicals.controller.js';

@Module({
  controllers: [ChemicalsController],
  providers: [ChemicalsService],
})
export class ChemicalsModule {}

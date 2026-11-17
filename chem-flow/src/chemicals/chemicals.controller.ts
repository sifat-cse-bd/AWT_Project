import { Controller } from '@nestjs/common';
import { ChemicalsService } from './chemicals.service.js';

@Controller('chemicals')
export class ChemicalsController {
  constructor(private readonly chemicalsService: ChemicalsService) {}
}

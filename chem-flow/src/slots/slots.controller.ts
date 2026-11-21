import { Controller } from '@nestjs/common';
import { SlotsService } from './slots.service.js';

@Controller('slots')
export class SlotsController {
  constructor(private readonly slotsService: SlotsService) {}
}

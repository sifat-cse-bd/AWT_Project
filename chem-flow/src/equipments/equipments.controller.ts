import { Controller } from '@nestjs/common';
import { EquipmentsService } from './equipments.service.js';

@Controller('equipments')
export class EquipmentsController {
  constructor(private readonly equipmentsService: EquipmentsService) {}
}

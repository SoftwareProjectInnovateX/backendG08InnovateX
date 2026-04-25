import { Controller, Post } from '@nestjs/common';
import { PharmacistSystemService } from '../services/pharmacist-system.service.js';

@Controller('pharmacist/system')
export class PharmacistSystemController {
  constructor(private readonly systemService: PharmacistSystemService) {}

  @Post('reset')
  async resetSystemData() {
    return this.systemService.resetSystemData();
  }
}

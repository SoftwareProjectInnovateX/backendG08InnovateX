import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { PharmacistPrescriptionsService } from '../services/pharmacist-prescriptions.service.js';

@Controller('pharmacist/prescriptions')
export class PharmacistPrescriptionsController {
  constructor(private readonly prescriptionsService: PharmacistPrescriptionsService) {}

  @Get()
  async getPrescriptions() {
    return this.prescriptionsService.getPrescriptions();
  }

  @Post()
  async addPrescription(@Body() prescriptionData: any) {
    return this.prescriptionsService.addPrescription(prescriptionData);
  }

  @Put(':id')
  async updatePrescription(@Param('id') id: string, @Body() updateData: any) {
    return this.prescriptionsService.updatePrescription(id, updateData);
  }
}

import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { PharmacistPatientsService } from '../services/pharmacist-patients.service.js';

@Controller('pharmacist/patients')
export class PharmacistPatientsController {
  constructor(private readonly patientsService: PharmacistPatientsService) {}

  @Get()
  async getPatients() {
    return this.patientsService.getPatients();
  }

  @Post()
  async addPatient(@Body() patientData: any) {
    return this.patientsService.addPatient(patientData);
  }

  @Put(':id')
  async updatePatient(@Param('id') id: string, @Body() updateData: any) {
    return this.patientsService.updatePatient(id, updateData);
  }
}

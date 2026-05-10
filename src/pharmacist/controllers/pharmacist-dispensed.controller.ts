import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { PharmacistDispensedService } from '../services/pharmacist-dispensed.service.js';

@Controller('pharmacist/dispensed')
export class PharmacistDispensedController {
  constructor(private readonly dispensedService: PharmacistDispensedService) {}

  @Get()
  async getDispensedHistory() {
    return this.dispensedService.getDispensedHistory();
  }

  @Post()
  async addDispensedRecord(@Body() dispenseData: any) {
    return this.dispensedService.addDispensedRecord(dispenseData);
  }

  @Put(':id/settle-payment')
  async settlePayment(@Param('id') id: string) {
    return this.dispensedService.updateDispensedRecord(id, { paymentStatus: 'paid' });
  }

  @Put(':id')
  async updateDispensedRecord(@Param('id') id: string, @Body() updateData: any) {
    return this.dispensedService.updateDispensedRecord(id, updateData);
  }
}
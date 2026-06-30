import { Controller, Get, Post, Put, Body, Param, UseGuards, Req } from '@nestjs/common';
import { PharmacistDispensedService } from '../services/pharmacist-dispensed.service.js';
import { FirebaseAuthGuard } from '../../auth/firebase-auth.guard.js';

@Controller('pharmacist/dispensed')
export class PharmacistDispensedController {
  constructor(private readonly dispensedService: PharmacistDispensedService) {}

  @Get()
  async getDispensedHistory() {
    return this.dispensedService.getDispensedHistory();
  }

  @UseGuards(FirebaseAuthGuard)
  @Post()
  async addDispensedRecord(@Req() req: any, @Body() dispenseData: any) {
    // Populate patientEmail from authenticated user when available
    try {
      const userEmail = req?.user?.email;
      if (userEmail) {
        dispenseData.patientEmail = userEmail;
      }
    } catch (err) {
      // If guard didn't run for some reason, continue without blocking
      console.warn('Could not resolve authenticated user email for dispensed record:', err?.message || err);
    }

    return this.dispensedService.addDispensedRecord(dispenseData);
  }

  @Put(':id/settle-payment')
  @UseGuards(FirebaseAuthGuard)
  async settlePayment(@Param('id') id: string) {
    return this.dispensedService.updateDispensedRecord(id, { paymentStatus: 'paid' });
  }

  @Put(':id')
  @UseGuards(FirebaseAuthGuard)
  async updateDispensedRecord(@Param('id') id: string, @Body() updateData: any) {
    return this.dispensedService.updateDispensedRecord(id, updateData);
  }
}
import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { PharmacistReturnsService } from '../services/pharmacist-returns.service.js';

@Controller('pharmacist/returns')
export class PharmacistReturnsController {
  constructor(private readonly returnsService: PharmacistReturnsService) {}

  @Get()
  async getReturnRequests() {
    return this.returnsService.getReturnRequests();
  }

  @Post()
  async addReturnRequest(@Body() returnData: any) {
    return this.returnsService.addReturnRequest(returnData);
  }

  // Approve + restock
  @Put(':id/approve')
  async approveReturn(
    @Param('id') id: string,
    @Body() body: { adjNote: string; items: any[] },
  ) {
    return this.returnsService.approveReturn(id, body.adjNote, body.items);
  }

  // Reject only
  @Put(':id/reject')
  async rejectReturn(
    @Param('id') id: string,
    @Body() body: { adjNote: string },
  ) {
    return this.returnsService.rejectReturn(id, body.adjNote);
  }

  // Generic update (keep for backwards compat)
  @Put(':id')
  async updateReturnRequest(@Param('id') id: string, @Body() updateData: any) {
    return this.returnsService.updateReturnRequest(id, updateData);
  }
}
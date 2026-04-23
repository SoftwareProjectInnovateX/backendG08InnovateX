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

  @Put(':id')
  async updateReturnRequest(@Param('id') id: string, @Body() updateData: any) {
    return this.returnsService.updateReturnRequest(id, updateData);
  }
}

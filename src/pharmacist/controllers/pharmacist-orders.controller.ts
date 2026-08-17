import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { PharmacistOrdersService } from '../services/pharmacist-orders.service.js';

@Controller('pharmacist/orders')
export class PharmacistOrdersController {
  constructor(private readonly ordersService: PharmacistOrdersService) {}

  // ── MUST come before @Get(':id') if you ever add one ──
  @Get('returns')
  async getReturns() {
    return this.ordersService.getReturns();
  }

  @Put('returns/:id')
  async updateReturnStatus(@Param('id') id: string, @Body() updateData: any) {
    return this.ordersService.updateReturnStatus(id, updateData);
  }

  // ── General order routes ──
  @Get()
  async getOnlineOrders() {
    return this.ordersService.getOnlineOrders();
  }

  @Post()
  async addOnlineOrder(@Body() orderData: any) {
    return this.ordersService.addOnlineOrder(orderData);
  }

  @Put(':id')
  async updateOnlineOrder(@Param('id') id: string, @Body() updateData: any) {
    return this.ordersService.updateOnlineOrder(id, updateData);
  }
}

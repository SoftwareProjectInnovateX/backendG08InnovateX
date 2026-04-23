import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { PharmacistOrdersService } from '../services/pharmacist-orders.service.js';

@Controller('pharmacist/orders')
export class PharmacistOrdersController {
  constructor(private readonly ordersService: PharmacistOrdersService) {}

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

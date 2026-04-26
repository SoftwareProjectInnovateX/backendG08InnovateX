import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('customer-orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async createOrder(@Body() body: any) {
    return this.ordersService.createOrder(body);
  }

  @Get()
  async getOrders() {
    return this.ordersService.getOrders();
  }

  @Get('delivered')
  async getDeliveredOrders() {
    return this.ordersService.getDeliveredOrders();
  }

  @Get('product-code/:name')
  async getProductCode(@Param('name') name: string) {
    return this.ordersService.getProductCodeByName(name);
  }

  @Post('notify')
  async notify(@Body() body: any) {
    return this.ordersService.handleNotify(body);
  }
}
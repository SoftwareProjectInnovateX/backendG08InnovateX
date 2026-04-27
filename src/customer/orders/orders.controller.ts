import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
// ─── CHANGED: added Query to imports
import { OrdersService } from './orders.service';

@Controller('customer-orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}


  //listens to POST request.gets frontend data
  @Post()
  async createOrder(@Body() body: any) {
    return this.ordersService.createOrder(body);
  }

  // ─── CHANGED: added optional ?userId=xxx query parameter
  // Frontend calls: GET /api/customer-orders  (returns all, frontend filters)
  // Can also call:  GET /api/customer-orders?userId=abc123  (filters server-side)
  @Get()
  async getOrders(@Query('userId') userId?: string) {
    return this.ordersService.getOrders(userId);
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
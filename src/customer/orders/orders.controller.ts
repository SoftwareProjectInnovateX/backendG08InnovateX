import { Controller, Post, Get, Body } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // ==============================
  // PLACE ORDER
  // ==============================
  @Post()
  async createOrder(@Body() body: any) {
    return this.ordersService.createOrder(body);
  }

  // ==============================
  // GET ALL ORDERS
  // ==============================
  @Get()
  async getOrders() {
    return this.ordersService.getOrders();
  }

  // ==============================
  // PAYHERE NOTIFY
  // ==============================
  @Post('notify')
  async notify(@Body() body: any) {
    return this.ordersService.handleNotify(body);
  }
}

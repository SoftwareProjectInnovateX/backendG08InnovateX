import { Controller, Post, Get, Body, Param } from '@nestjs/common';
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
  // GET ORDER STATUS
  // ==============================
  @Get(':id/status')
  async getOrderStatus(@Param('id') id: string) {
    return this.ordersService.getOrderStatus(id);
  }

  // ==============================
  // CONFIRM PAYMENT (FOR LOCAL DEV)
  // ==============================
  @Post(':id/confirm')
  async confirmPayment(@Param('id') id: string) {
    return this.ordersService.confirmPaymentLocally(id);
  }

  // ==============================
  // PAYHERE NOTIFY
  // ==============================
  @Post('notify')
  async notify(@Body() body: any) {
    return this.ordersService.handleNotify(body);
  }
}

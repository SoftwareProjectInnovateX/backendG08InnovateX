import { Controller, Post, Get, Put, Body, Param, Query } from '@nestjs/common';
// ─── CHANGED: added Put to imports (needed for settle-payment endpoint)
import { OrdersService } from './orders.service';

@Controller('customer-orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // ─── UNCHANGED ─────────────────────────────────────────────────────────────
  @Post()
  async createOrder(@Body() body: any) {
    return this.ordersService.createOrder(body);
  }

  // ─── UNCHANGED ─────────────────────────────────────────────────────────────
  @Get()
  async getOrders(@Query('userId') userId?: string) {
    return this.ordersService.getOrders(userId);
  }

  // ─── UNCHANGED ─────────────────────────────────────────────────────────────
  @Get('delivered')
  async getDeliveredOrders() {
    return this.ordersService.getDeliveredOrders();
  }

  // ─── UNCHANGED ─────────────────────────────────────────────────────────────
  @Get('product-code/:name')
  async getProductCode(@Param('name') name: string) {
    return this.ordersService.getProductCodeByName(name);
  }

  // ─── UNCHANGED ─────────────────────────────────────────────────────────────
  @Post('notify')
  async notify(@Body() body: any) {
    return this.ordersService.handleNotify(body);
  }

  // ─── NEW: settle-payment endpoint ─────────────────────────────────────────
  // Called by the pharmacist Orders page when they click "Payment Settled".
  // :id is the CustomerOrders document ID.
  // Updates CustomerOrders, payments, and purchaseOrders collections.
  @Put(':id/settle-payment')
  async settlePayment(@Param('id') id: string) {
    return this.ordersService.settlePayment(id);
  }
}
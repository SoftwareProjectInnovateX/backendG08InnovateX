import { Controller, Post, Get, Put, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
// ─── CHANGED: added Put to imports (needed for settle-payment endpoint)
import { OrdersService } from './orders.service';
import { FirebaseAuthGuard } from '../../auth/firebase-auth.guard.js';

@Controller('customer-orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // ─── SECURE: only authenticated customers can create orders
  @UseGuards(FirebaseAuthGuard)
  @Post()
  async createOrder(@Request() req: any, @Body() body: any) {
    return this.ordersService.createOrder(body, req.user);
  }

  // ─── SECURE: only authenticated customers can fetch their own orders
  @UseGuards(FirebaseAuthGuard)
  @Get()
  async getOrders(@Request() req: any) {
    return this.ordersService.getOrders(req.user.uid, req.user.email);
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
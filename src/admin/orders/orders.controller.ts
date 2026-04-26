import { Controller, Get, Param, Post, Body, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service.js';
import { FirebaseAuthGuard } from '../../auth/firebase-auth.guard.js';
import { RolesGuard } from '../../auth/roles.guard.js';
import { Roles } from '../../auth/roles.decorator.js';

@Controller('orders')
@UseGuards(FirebaseAuthGuard, RolesGuard)
@Roles('admin')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  getAll() {
    return this.ordersService.getAllOrders();
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.ordersService.getOrderById(id);
  }

  @Post()
  async create(@Body() orderData: any) {
    
    return await this.ordersService.createOrder(orderData);
  }
}

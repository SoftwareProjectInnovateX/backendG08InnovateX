import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { CartService } from './cart.service';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get(':customerId')
  async getCart(@Param('customerId') customerId: string) {
    return this.cartService.getCart(customerId);
  }

  @Post()
  async addItem(@Body() body: any) {
    return this.cartService.addItem(body);
  }

  @Patch(':id')
  async updateQty(@Param('id') id: string, @Body() body: { qty: number }) {
    return this.cartService.updateQty(id, body.qty);
  }

  @Delete('clear/:customerId')
  async clearCart(@Param('customerId') customerId: string) {
    return this.cartService.clearCart(customerId);
  }

  @Delete(':id')
  async removeItem(@Param('id') id: string) {
    return this.cartService.removeItem(id);
  }
}
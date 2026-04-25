import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { CartService } from './cart.service';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // ==============================
  // GET ALL CART ITEMS
  // ==============================
  @Get()
  async getAll() {
    return this.cartService.getAll();
  }

  // ==============================
  // ADD ITEM TO CART
  // ==============================
  @Post()
  async addItem(@Body() body: any) {
    return this.cartService.addItem(body);
  }

  // ==============================
  // UPDATE QTY
  // ==============================
  @Patch(':id')
  async updateQty(@Param('id') id: string, @Body() body: { qty: number }) {
    return this.cartService.updateQty(id, body.qty);
  }

  // ==============================
  // CLEAR CART
  // IMPORTANT: must be ABOVE @Delete(':id')
  // ==============================
  @Delete()
  async clearCart() {
    return this.cartService.clearCart();
  }

  // ==============================
  // REMOVE SINGLE ITEM
  // ==============================
  @Delete(':id')
  async removeItem(@Param('id') id: string) {
    return this.cartService.removeItem(id);
  }
}
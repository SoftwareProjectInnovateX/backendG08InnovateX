import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { CartService } from './cart.service';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // ==============================
  // GET ALL CART ITEMS
  // ==============================
  @Get()
  getAll() {
    return this.cartService.getAll();
  }

  // ==============================
  // ADD ITEM TO CART
  // ==============================
  @Post()
  addItem(@Body() body: any) {
    return this.cartService.addItem(body);
  }

  // ==============================
  // DELETE SINGLE ITEM
  // ==============================
  @Delete(':id')
  removeItem(@Param('id') id: string) {
    return this.cartService.removeItem(Number(id));
  }

  // ==============================
  // CLEAR CART
  // ==============================
  @Delete()
  clearCart() {
    return this.cartService.clearCart();
  }
}
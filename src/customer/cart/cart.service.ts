import { Injectable } from '@nestjs/common';

// ==============================
// TYPE FOR CART ITEM
// ==============================
export interface CartItem {
  id: number;
  [key: string]: any;
}

@Injectable()
export class CartService {
  // In-memory cart (replace with DB later)
  private cart: CartItem[] = [];

  // ==============================
  // GET ALL CART ITEMS
  // ==============================
  getAll() {
    return this.cart;
  }

  // ==============================
  // ADD ITEM TO CART
  // ==============================
  addItem(body: any) {
    const item: CartItem = {
      ...body,
      id: Date.now(),
    };
    this.cart.push(item);
    return item;
  }

  // ==============================
  // DELETE SINGLE ITEM
  // ==============================
  removeItem(id: number) {
    this.cart = this.cart.filter((i) => i.id !== id);
    return { success: true };
  }

  // ==============================
  // CLEAR CART
  // ==============================
  clearCart() {
    this.cart = [];
    return { success: true };
  }
}

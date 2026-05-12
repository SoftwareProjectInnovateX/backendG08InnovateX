import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../shared/firebase/firebase.service';
import { ProductsService } from '../products/products.service';

@Injectable()
export class CartService {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly productsService: ProductsService,
  ) {}

  // ==============================
  // GET CART ITEMS BY CUSTOMER
  // ==============================
  async getCart(customerId: string) {
    const db       = this.firebaseService.getDb();
    const snapshot = await db
      .collection('cart')
      .where('customerId', '==', customerId)
      .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  // ==============================
  // ADD ITEM
  // ==============================
  async addItem(body: any) {
    const db     = this.firebaseService.getDb();
    const docRef = await db.collection('cart').add({
      customerId: body.customerId,
      productId:  body.productId,
      stockId:    body.stockId || body.productId || '',
      name:       body.name,
      price:      Number(body.price)  || 0,
      imageUrl:   body.imageUrl       || '',
      qty:        Number(body.qty)    || 1,
    });
    return { success: true, id: docRef.id, ...body };
  }

  // ==============================
  // UPDATE QTY
  // ==============================
  async updateQty(id: string, qty: number) {
    const db  = this.firebaseService.getDb();
    const ref = db.collection('cart').doc(id);
    const snap = await ref.get();
    if (!snap.exists) {
      return { success: false, message: 'Cart item not found' };
    }

    const item = snap.data() as { qty?: number; stockId?: string; productId?: string };
    const currentQty = Number(item?.qty) || 0;
    const nextQty    = Number(qty) || 0;
    const delta      = nextQty - currentQty;
    const stockKey   = item?.stockId || item?.productId || '';

    if (delta > 0) {
      await this.productsService.decrementStock(stockKey, delta);
    } else if (delta < 0) {
      await this.productsService.incrementStock(stockKey, Math.abs(delta));
    }

    if (nextQty <= 0) {
      await ref.delete();
      return { success: true, id };
    }

    await ref.update({ qty: nextQty });
    const updated = await ref.get();
    return { id: updated.id, ...updated.data() };
  }

  // ==============================
  // REMOVE SINGLE ITEM
  // ==============================
  async removeItem(id: string) {
    const db = this.firebaseService.getDb();
    const ref = db.collection('cart').doc(id);
    const snap = await ref.get();
    if (!snap.exists) {
      return { success: false, message: 'Cart item not found' };
    }

    const item = snap.data() as { qty?: number; stockId?: string; productId?: string };
    const stockKey = item?.stockId || item?.productId || '';
    await this.productsService.incrementStock(stockKey, Number(item?.qty) || 1);
    await ref.delete();
    return { success: true, id };
  }

  // ==============================
  // CLEAR CART BY CUSTOMER
  // ==============================
  async clearCart(customerId: string) {
    const db       = this.firebaseService.getDb();
    const snapshot = await db
      .collection('cart')
      .where('customerId', '==', customerId)
      .get();

    if (snapshot.empty) return { success: true };

    for (const doc of snapshot.docs) {
      const item = doc.data();
      const stockKey = item.stockId || item.productId || '';
      await this.productsService.incrementStock(stockKey, Number(item.qty) || 1);
    }

    const batch = db.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    return { success: true };
  }
}
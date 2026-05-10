import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../shared/firebase/firebase.service';

@Injectable()
export class CartService {
  constructor(private readonly firebaseService: FirebaseService) {}

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
    await ref.update({ qty });
    const snap = await ref.get();
    return { id: snap.id, ...snap.data() };
  }

  // ==============================
  // REMOVE SINGLE ITEM
  // ==============================
  async removeItem(id: string) {
    const db = this.firebaseService.getDb();
    await db.collection('cart').doc(id).delete();
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

    const batch = db.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    return { success: true };
  }
}
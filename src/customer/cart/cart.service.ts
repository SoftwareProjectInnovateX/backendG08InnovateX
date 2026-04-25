import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../shared/firebase/firebase.service';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  imageUrl?: string;
  qty: number;
}

@Injectable()
export class CartService {
  constructor(private readonly firebaseService: FirebaseService) {}

  // ==============================
  // GET ALL ITEMS
  // ==============================
  async getAll(): Promise<CartItem[]> {
    const db       = this.firebaseService.getDb();
    const snapshot = await db.collection('cart').get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as CartItem[];
  }

  // ==============================
  // ADD ITEM
  // Strip any incoming 'id' — let Firestore generate the doc ID.
  // ==============================
  async addItem(body: any): Promise<CartItem> {
    const db              = this.firebaseService.getDb();
    const { id, ...rest } = body;
    const docRef          = await db.collection('cart').add(rest);
    return { id: docRef.id, ...rest } as CartItem;
  }

  // ==============================
  // UPDATE QTY by Firestore doc ID
  // ==============================
  async updateQty(id: string, qty: number): Promise<CartItem> {
    const db  = this.firebaseService.getDb();
    const ref = db.collection('cart').doc(id);
    await ref.update({ qty });
    const snap = await ref.get();
    return { id: snap.id, ...snap.data() } as CartItem;
  }

  // ==============================
  // REMOVE SINGLE ITEM by Firestore doc ID
  // Firestore .delete() silently succeeds even if doc doesn't exist —
  // no need for an existence check, so stale IDs never cause 404s.
  // ==============================
  async removeItem(id: string): Promise<{ success: boolean; id: string }> {
    const db = this.firebaseService.getDb();
    await db.collection('cart').doc(id).delete();
    return { success: true, id };
  }

  // ==============================
  // CLEAR ENTIRE CART (batch delete)
  // ==============================
  async clearCart(): Promise<{ success: boolean }> {
    const db       = this.firebaseService.getDb();
    const snapshot = await db.collection('cart').get();
    if (snapshot.empty) return { success: true };

    const batch = db.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    return { success: true };
  }
}
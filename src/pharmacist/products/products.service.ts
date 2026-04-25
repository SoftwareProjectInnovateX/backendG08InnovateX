import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../shared/firebase/firebase.service';
import { FieldValue } from 'firebase-admin/firestore';

@Injectable()
export class ProductsService {
  constructor(private readonly firebaseService: FirebaseService) {}

  // ==============================
  // GET PENDING PRODUCTS (approved by admin)
  // ==============================
  async getPendingProducts() {
    const db       = this.firebaseService.getDb();
    const snapshot = await db
      .collection('pendingProducts')
      .where('status', '==', 'approved')
      .get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  // ==============================
  // MARK PENDING PRODUCT AS PHARMACIST APPROVED
  // ==============================
  async approvePending(id: string) {
    const db = this.firebaseService.getDb();
    await db.collection('pendingProducts').doc(id).update({
      status: 'pharmacist_approved',
    });
    return { success: true, id };
  }

  // ==============================
  // ADD PRODUCT TO pharmacistProducts
  // ==============================
  async addProduct(body: any) {
    const db     = this.firebaseService.getDb();
    const docRef = await db.collection('pharmacistProducts').add({
      name:        body.name,
      price:       Number(body.price),
      description: body.description,
      imageUrl:    body.imageUrl,
      category:    body.category,
      supplierId:  body.supplierId,
      stockId:     body.stockId,
      retailPrice: Number(body.price),
      tags:        body.tags ?? [],
      status:      'active',
      createdAt:   FieldValue.serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  }
}
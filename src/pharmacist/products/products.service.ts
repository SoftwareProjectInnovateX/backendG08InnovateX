import { Injectable, BadRequestException } from '@nestjs/common';
import { FirebaseService } from '../../shared/firebase/firebase.service';
import { FieldValue } from 'firebase-admin/firestore';

const VALID_VISIBILITY = ['customer', 'pharmacist_only'] as const;
type Visibility = typeof VALID_VISIBILITY[number];

@Injectable()
export class ProductsService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async getPendingProducts() {
    const db       = this.firebaseService.getDb();
    const snapshot = await db
      .collection('products')
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async getAllPharmacistProducts() {
    const db       = this.firebaseService.getDb();
    const snapshot = await db
      .collection('pharmacistProducts')
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async getCustomerProducts() {
    const db = this.firebaseService.getDb();
    try {
      const snapshot = await db
        .collection('pharmacistProducts')
        .where('visibility', '==', 'customer')
        .get();

      const productList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('pharmacistProducts fetched:', productList.length);

      const stockSnapshot = await db.collection('products').get();
      const stockMap: Record<string, number> = {};
      stockSnapshot.docs.forEach(doc => {
        const data = doc.data();
        stockMap[data.productCode || doc.id] = data.stock ?? 0;
      });
      console.log('stockMap keys:', Object.keys(stockMap));

      return productList.map(p => {
        const stockId     = (p as any).stockId;
        const productCode = (p as any).productCode;
        console.log('Matching:', stockId, productCode, '→ stock:', stockMap[stockId], stockMap[productCode]);
        return {
          ...p,
          stock: stockMap[stockId] ?? stockMap[productCode] ?? 0,
        };
      });
    } catch (err) {
      console.error('getCustomerProducts ERROR:', err);
      throw err;
    }
  }

  async approvePending(id: string) {
    const db = this.firebaseService.getDb();
    await db.collection('products').doc(id).update({
      status: 'pharmacist_approved',
    });
    return { success: true, id };
  }

  async addProduct(body: any) {
    const db = this.firebaseService.getDb();

    const visibility: Visibility = VALID_VISIBILITY.includes(body.visibility)
      ? body.visibility
      : 'customer';

    const docRef = await db.collection('pharmacistProducts').add({
      name:        body.name,
      price:       Number(body.price),
      description: body.description  ?? '',
      imageUrl:    body.imageUrl     ?? '',
      category:    body.category     ?? '',
      supplierId:  body.supplierId   ?? '',
      stockId:     body.stockId      ?? '',
      retailPrice: Number(body.price),
      tags:        body.tags         ?? [],
      visibility,
      status:      'active',
      createdAt:   FieldValue.serverTimestamp(),
    });

    return { success: true, id: docRef.id, visibility };
  }

  async updateVisibility(id: string, visibility: string) {
    if (!VALID_VISIBILITY.includes(visibility as Visibility)) {
      throw new BadRequestException(
        `Invalid visibility. Must be one of: ${VALID_VISIBILITY.join(', ')}`,
      );
    }

    const db = this.firebaseService.getDb();
    await db
      .collection('pharmacistProducts')
      .doc(id)
      .update({ visibility });

    return { success: true, id, visibility };
  }
}
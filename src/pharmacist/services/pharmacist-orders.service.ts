import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../shared/firebase/firebase.service.js';
import { FieldValue } from 'firebase-admin/firestore';

@Injectable()
export class PharmacistOrdersService {
  private readonly collectionName    = 'CustomerOrders';
  private readonly returnsCollection = 'CustomerReturns';

  constructor(private readonly firebaseService: FirebaseService) {}

  async getOnlineOrders() {
    const db       = this.firebaseService.getDb();
    const snapshot = await db
      .collection(this.collectionName)
      .orderBy('createdAt', 'desc')
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async addOnlineOrder(orderData: any) {
    const db     = this.firebaseService.getDb();
    const docRef = await db.collection(this.collectionName).add(orderData);
    return { id: docRef.id, ...orderData };
  }

  async updateOnlineOrder(id: string, updateData: any) {
    const db = this.firebaseService.getDb();
    await db.collection(this.collectionName).doc(id).update(updateData);
    return { id, ...updateData };
  }

  async getReturns() {
    const db       = this.firebaseService.getDb();
    const snapshot = await db
      .collection(this.returnsCollection)
      .orderBy('createdAt', 'desc')
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async updateReturnStatus(id: string, updateData: any) {
    const db = this.firebaseService.getDb();

    // Read FIRST before updating
    const returnSnap = await db.collection(this.returnsCollection).doc(id).get();
    const returnData = returnSnap.data();
    const items: any[] = returnData?.items || [];

    console.log('Return items:', items);
    console.log('Update data:', updateData);

    // Then update the return document
    await db.collection(this.returnsCollection).doc(id).update(updateData);

    // Only restore stock when approving
    if (updateData.returnStatus === 'approved') {
      for (const item of items) {
        const productCode = item.id;
        const quantity    = item.quantity || 1;

        if (!productCode) continue;

        const productSnap = await db
          .collection('products')
          .where('productCode', '==', productCode)
          .limit(1)
          .get();

        if (!productSnap.empty) {
          const productDoc = productSnap.docs[0];
          await productDoc.ref.update({
            stock: FieldValue.increment(quantity),
          });
          console.log(`Stock restored: ${productCode} +${quantity}`);
        } else {
          console.warn(`Product not found for code: ${productCode}`);
        }
      }
    }

    return { id, ...updateData };
  }
}
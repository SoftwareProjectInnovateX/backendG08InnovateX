import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../shared/firebase/firebase.service.js';
import { FieldValue } from 'firebase-admin/firestore';

@Injectable()
export class PharmacistReturnsService {
  private readonly collectionName = 'CustomerReturns';
  private readonly productsCollection = 'products';

  constructor(private readonly firebaseService: FirebaseService) {}

  async getReturnRequests() {
    const db = this.firebaseService.getDb();
    const snapshot = await db.collection(this.collectionName).get();
    const data = snapshot.docs.map(doc => ({ firebaseId: doc.id, id: doc.id, ...doc.data() }));
    data.sort((a: any, b: any) => (b.createdAt?._seconds ?? 0) - (a.createdAt?._seconds ?? 0));
    return data;
  }

  async addReturnRequest(returnData: any) {
    const db = this.firebaseService.getDb();
    const docRef = await db.collection(this.collectionName).add(returnData);
    return { id: docRef.id, ...returnData };
  }

  async updateReturnRequest(id: string, updateData: any) {
    const db = this.firebaseService.getDb();
    const docRef = db.collection(this.collectionName).doc(id);
    await docRef.update(updateData);
    return { id, ...updateData };
  }

  // Approve: update return doc + restock each item by productCode
  async approveReturn(id: string, adjNote: string, items: any[]) {
    const db = this.firebaseService.getDb();

    // Step 1: Update return document
    await db.collection(this.collectionName).doc(id).update({
      returnStatus:   'approved',
      refundStatus:   'processed',
      adjustmentNote: adjNote,
      processedAt:    FieldValue.serverTimestamp(),
    });

    // Step 2: Restock each item using productCode
    const restockResults: any[] = [];

    await Promise.all(
      items.map(async (item: any) => {
        const code = item.productCode;

        if (!code) {
          restockResults.push({ name: item.name, status: 'skipped', reason: 'missing productCode' });
          return;
        }

        // ✅ FIX: force positive integer — prevents negative/string quantity from decrementing stock
        const qty = Math.abs(parseInt(item.quantity, 10) || 1);

        const snap = await db
          .collection(this.productsCollection)
          .where('productCode', '==', code)
          .get();

        if (!snap.empty) {
          const productRef  = snap.docs[0].ref;
          const beforeStock = snap.docs[0].data().stock ?? 0;
          await productRef.update({
            stock: FieldValue.increment(qty),
          });
          restockResults.push({
            name: item.name,
            code,
            status: 'restocked',
            before: beforeStock,
            after:  beforeStock + qty,
          });
        } else {
          restockResults.push({ name: item.name, code, status: 'product_not_found' });
        }
      })
    );

    return { id, returnStatus: 'approved', refundStatus: 'processed', restockResults };
  }

  // Reject: update return doc only, no restock
  async rejectReturn(id: string, adjNote: string) {
    const db = this.firebaseService.getDb();
    await db.collection(this.collectionName).doc(id).update({
      returnStatus:   'rejected',
      refundStatus:   'rejected',
      adjustmentNote: adjNote,
      processedAt:    FieldValue.serverTimestamp(),
    });
    return { id, returnStatus: 'rejected', refundStatus: 'rejected' };
  }
}
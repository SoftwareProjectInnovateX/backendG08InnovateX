import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../shared/firebase/firebase.service.js';

@Injectable()
export class PharmacistOrdersService {
  private readonly collectionName    = 'CustomerOrders';
  private readonly returnsCollection = 'CustomerReturns';

  constructor(private readonly firebaseService: FirebaseService) {}

  async getOnlineOrders() {
    const db       = this.firebaseService.getDb();
    const snapshot = await db
      .collection(this.collectionName)
      .orderBy('createdAt', 'desc')   // ✅ added ordering
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
      .orderBy('createdAt', 'desc')   // ✅ added ordering
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async updateReturnStatus(id: string, updateData: any) {
    const db = this.firebaseService.getDb();
    await db.collection(this.returnsCollection).doc(id).update(updateData);
    return { id, ...updateData };
  }
}
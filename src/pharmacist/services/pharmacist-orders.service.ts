import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../shared/firebase/firebase.service.js';

@Injectable()
export class PharmacistOrdersService {
  private readonly collectionName = 'CustomerOrders';

  constructor(private readonly firebaseService: FirebaseService) {}

  async getOnlineOrders() {
    const db = this.firebaseService.getDb();
    const snapshot = await db.collection(this.collectionName).get();
    return snapshot.docs.map(doc => ({ firebaseId: doc.id, id: doc.id, ...doc.data() }));
  }

  async addOnlineOrder(orderData: any) {
    const db = this.firebaseService.getDb();
    const docRef = await db.collection(this.collectionName).add(orderData);
    return { id: docRef.id, ...orderData };
  }

  async updateOnlineOrder(id: string, updateData: any) {
    const db = this.firebaseService.getDb();
    const docRef = db.collection(this.collectionName).doc(id);
    await docRef.update(updateData);
    return { id, ...updateData };
  }
}

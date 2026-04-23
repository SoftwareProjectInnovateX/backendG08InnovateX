import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../shared/firebase/firebase.service.js';

@Injectable()
export class PharmacistReturnsService {
  private readonly collectionName = 'customerReturns';

  constructor(private readonly firebaseService: FirebaseService) {}

  async getReturnRequests() {
    const db = this.firebaseService.getDb();
    const snapshot = await db.collection(this.collectionName).get();
    return snapshot.docs.map(doc => ({ firebaseId: doc.id, id: doc.id, ...doc.data() }));
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
}

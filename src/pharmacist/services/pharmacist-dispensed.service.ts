import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../shared/firebase/firebase.service.js';

@Injectable()
export class PharmacistDispensedService {
  private readonly collectionName = 'pharmacistDispensed';

  constructor(private readonly firebaseService: FirebaseService) {}

  async getDispensedHistory() {
    const db = this.firebaseService.getDb();
    const snapshot = await db.collection(this.collectionName).get();
    return snapshot.docs.map(doc => ({ firebaseId: doc.id, id: doc.id, ...doc.data() }));
  }

  async addDispensedRecord(dispenseData: any) {
    const db = this.firebaseService.getDb();
    const docRef = await db.collection(this.collectionName).add(dispenseData);
    return { id: docRef.id, ...dispenseData };
  }

  async updateDispensedRecord(id: string, updateData: any) {
    const db = this.firebaseService.getDb();
    const docRef = db.collection(this.collectionName).doc(id);
    await docRef.update(updateData);
    return { id, ...updateData };
  }
}

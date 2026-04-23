import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../shared/firebase/firebase.service.js';

@Injectable()
export class PharmacistPrescriptionsService {
  private readonly collectionName = 'pharmacistPrescriptions';

  constructor(private readonly firebaseService: FirebaseService) {}

  async getPrescriptions() {
    const db = this.firebaseService.getDb();
    const snapshot = await db.collection(this.collectionName).get();
    return snapshot.docs.map(doc => ({ firebaseId: doc.id, id: doc.id, ...doc.data() }));
  }

  async addPrescription(prescriptionData: any) {
    const db = this.firebaseService.getDb();
    const docRef = await db.collection(this.collectionName).add(prescriptionData);
    return { id: docRef.id, ...prescriptionData };
  }

  async updatePrescription(id: string, updateData: any) {
    const db = this.firebaseService.getDb();
    const docRef = db.collection(this.collectionName).doc(id);
    await docRef.update(updateData);
    return { id, ...updateData };
  }
}

import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../shared/firebase/firebase.service.js';

@Injectable()
export class PharmacistPatientsService {
  private readonly collectionName = 'users';

  constructor(private readonly firebaseService: FirebaseService) {}

  async getPatients() {
    const db = this.firebaseService.getDb();
    const snapshot = await db.collection(this.collectionName).get();
    return snapshot.docs.map((doc) => ({
      firebaseId: doc.id,
      id: doc.id,
      ...doc.data(),
    }));
  }

  async addPatient(patientData: any) {
    const db = this.firebaseService.getDb();
    const docRef = await db.collection(this.collectionName).add(patientData);
    return { id: docRef.id, ...patientData };
  }

  async updatePatient(id: string, updateData: any) {
    const db = this.firebaseService.getDb();
    const docRef = db.collection(this.collectionName).doc(id);
    await docRef.update(updateData);
    return { id, ...updateData };
  }
}

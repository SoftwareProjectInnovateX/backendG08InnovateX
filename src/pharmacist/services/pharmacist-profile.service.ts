import { Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../../shared/firebase/firebase.service.js';

@Injectable()
export class PharmacistProfileService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async getProfile(pharmacistId: string) {
    const db = this.firebaseService.getDb();
    const docRef = db.collection('pharmacistProfiles').doc(pharmacistId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      throw new NotFoundException('Pharmacist profile not found');
    }

    return { id: docSnap.id, ...docSnap.data() };
  }

  async updateProfile(pharmacistId: string, updateData: any) {
    const db = this.firebaseService.getDb();
    const docRef = db.collection('pharmacistProfiles').doc(pharmacistId);
    await docRef.set(updateData, { merge: true });
    return { id: pharmacistId, ...updateData };
  }
}

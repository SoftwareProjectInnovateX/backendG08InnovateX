import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../shared/firebase/firebase.service.js';

@Injectable()
export class PharmacistSystemService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async resetSystemData() {
    const db = this.firebaseService.getDb();
    
    // 1. Clear all prescriptions
    const rxSnapshot = await db.collection('pharmacistPrescriptions').get();
    const rxBatch = db.batch();
    rxSnapshot.docs.forEach((doc) => {
      rxBatch.delete(doc.ref);
    });
    await rxBatch.commit();
    
    // 2. Clear all dispensed history
    const dispSnapshot = await db.collection('pharmacistDispensed').get();
    const dispBatch = db.batch();
    dispSnapshot.docs.forEach((doc) => {
      dispBatch.delete(doc.ref);
    });
    await dispBatch.commit();
    
    return { success: true, message: 'System data reset successfully' };
  }
}

import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../shared/firebase/firebase.service.js';

@Injectable()
export class PharmacistSystemService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async resetSystemData() {
    const db = this.firebaseService.getDb();

    const collectionsToReset = [
      'pharmacistPrescriptions',
      'pharmacistDispensed',
      'CustomerOrders',
      'prescriptions',
      'CustomerReturns',
      'pharmacistReturns',
      'pharmacistNotifications',
      'pharmacistPatients'
    ];

    for (const colName of collectionsToReset) {
      try {
        const snapshot = await db.collection(colName).get();
        if (snapshot.empty) continue;

        const batch = db.batch();
        snapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });
        await batch.commit();
        console.log(`Cleared collection: ${colName}`);
      } catch (e) {
        console.error(`Failed to clear collection ${colName}:`, e);
      }
    }

    return { success: true, message: 'System data reset successfully across all operational modules' };
  }
}

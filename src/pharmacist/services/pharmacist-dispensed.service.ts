import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../shared/firebase/firebase.service.js';
import { LoyaltyService } from '../../customer/loyalty/loyalty.service.js';

@Injectable()
export class PharmacistDispensedService {
  private readonly collectionName = 'pharmacistDispensed';

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly loyaltyService: LoyaltyService,
  ) {}

  async getDispensedHistory() {
    const db = this.firebaseService.getDb();
    const snapshot = await db.collection(this.collectionName).get();
    return snapshot.docs.map(doc => ({ firebaseId: doc.id, id: doc.id, ...doc.data() }));
  }

  async addDispensedRecord(dispenseData: any) {
    const db = this.firebaseService.getDb();
    // Ensure a patientEmail field exists (may be populated by controller via auth)
    if (!dispenseData.createdAt) dispenseData.createdAt = new Date().toISOString();
    const docRef = await db.collection(this.collectionName).add(dispenseData);
    return { id: docRef.id, ...dispenseData };
  }

  async updateDispensedRecord(id: string, updateData: any) {
    const db = this.firebaseService.getDb();

    // Update pharmacistDispensed as before
    const docRef = db.collection(this.collectionName).doc(id);
    await docRef.update(updateData);

    // If this is a payment settlement, also update the payments collection
    if (updateData.paymentStatus === 'paid') {
      try {
          const dispensedDoc = await docRef.get();
        const dispensedData = dispensedDoc.data();

        // rxId is the link to payments.purchaseOrderId
        const rxId = dispensedData?.rxId;

        if (rxId) {
          const paymentSnap = await db.collection('payments')
            .where('purchaseOrderId', '==', rxId)
            .get();

          if (!paymentSnap.empty) {
            const batch = db.batch();
            paymentSnap.docs.forEach(doc => {
              batch.update(doc.ref, { status: 'PAID' });
            });
            await batch.commit();
            console.log(`Updated ${paymentSnap.size} payment(s) for rxId: ${rxId}`);
          } else {
            console.warn(`No payments found for rxId: ${rxId}`);
          }
        } else {
          console.warn('No rxId found in dispensed document:', id);
        }
          // If payment settled, try to credit loyalty points
          try {
            const patientEmail = dispensedData?.patientEmail || updateData?.patientEmail;
            const amount = Number(dispensedData?.total || updateData?.total || 0);
            if (patientEmail && amount > 0) {
              // resolve uid from users collection
              const userSnap = await db.collection('users').where('email', '==', patientEmail).limit(1).get();
              if (!userSnap.empty) {
                const userDoc = userSnap.docs[0];
                const uid = userDoc.id;
                // Use rxId as orderId when available
                const orderId = dispensedData?.rxId || id;
                await this.loyaltyService.addPurchase(uid, amount, orderId);
                console.log(`Credited loyalty for uid=${uid} from dispensed id=${id}`);
              } else {
                console.warn('Could not find user for patientEmail when crediting loyalty:', patientEmail);
              }
            }
          } catch (err) {
            console.warn('Failed to credit loyalty on dispensed payment:', err?.message || err);
          }
      } catch (err) {
        console.warn('Could not sync payment status to payments collection:', err.message);
      }
    }

    return { id, ...updateData };
  }
}
import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../shared/firebase/firebase.service.js';
import { LoyaltyService } from '../../customer/loyalty/loyalty.service.js';
import { FieldValue } from 'firebase-admin/firestore';

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
    return snapshot.docs.map((doc) => ({
      firebaseId: doc.id,
      id: doc.id,
      ...doc.data(),
    }));
  }

  async addDispensedRecord(dispenseData: any) {
    const db = this.firebaseService.getDb();
    // Ensure a patientEmail field exists (may be populated by controller via auth)
    if (!dispenseData.createdAt)
      dispenseData.createdAt = new Date().toISOString();
    const docRef = await db.collection(this.collectionName).add(dispenseData);
    return { id: docRef.id, ...dispenseData };
  }

  // ─── Send a notification to the customer ────────────────────────────────────
  private async notifyCustomer(
    userId: string | null | undefined,
    type: 'completed' | 'cancelled',
    orderId: string,
    cancelReason?: string,
  ) {
    if (!userId) return;
    const db = this.firebaseService.getDb();

    const isCompleted = type === 'completed';
    const title = isCompleted
      ? 'Your order is out for delivery! 🚚'
      : 'Your order has been cancelled ❌';
    const message = isCompleted
      ? 'Your prescription order has been processed and dispatched for delivery. Please be available to receive it.'
      : cancelReason
        ? `Your order has been cancelled. Reason: ${cancelReason}`
        : 'Your prescription order has been cancelled by the pharmacist. Please contact us for more details.';

    try {
      await db.collection('notifications').add({
        recipientType: 'customer',
        userId,
        orderId,
        type: isCompleted ? 'ORDER_DISPATCHED' : 'ORDER_CANCELLED',
        title,
        message,
        read: false,
        createdAt: FieldValue.serverTimestamp(),
      });
      console.log(`Customer notification sent: ${type} for userId=${userId}`);
    } catch (err) {
      console.warn('Failed to send customer notification:', err?.message || err);
    }
  }

  // ─── Update CustomerOrders status when prescription is completed/cancelled ──
  private async updateCustomerOrderStatus(
    orderId: string | null | undefined,
    status: string,
  ) {
    if (!orderId) return;
    const db = this.firebaseService.getDb();
    try {
      // Try direct doc update first
      const docRef = db.collection('CustomerOrders').doc(orderId);
      const snap = await docRef.get();
      if (snap.exists) {
        await docRef.update({ orderStatus: status });
        console.log(`CustomerOrders ${orderId} → orderStatus: ${status}`);
        return;
      }
      // Fallback: search by orderId field
      const query = await db
        .collection('CustomerOrders')
        .where('orderId', '==', orderId)
        .limit(1)
        .get();
      if (!query.empty) {
        await query.docs[0].ref.update({ orderStatus: status });
        console.log(`CustomerOrders (by orderId field) ${orderId} → orderStatus: ${status}`);
      }
    } catch (err) {
      console.warn('Failed to update CustomerOrders status:', err?.message || err);
    }
  }

  async updateDispensedRecord(id: string, updateData: any) {
    const db = this.firebaseService.getDb();

    // Update pharmacistDispensed as before
    const docRef = db.collection(this.collectionName).doc(id);
    await docRef.update(updateData);

    // ─── Handle completed / cancelled status ────────────────────────────────
    const newStatus = (updateData.status || '').toLowerCase();
    if (newStatus === 'completed' || newStatus === 'cancelled') {
      const dispensedDoc = await docRef.get();
      const dispensedData = dispensedDoc.data();
      const userId = dispensedData?.userId || updateData?.userId;
      const orderId =
        dispensedData?.customerOrderId ||
        dispensedData?.orderId ||
        updateData?.customerOrderId ||
        updateData?.orderId;
      const cancelReason = updateData?.cancelReason;

      // Send notification to customer
      await this.notifyCustomer(userId, newStatus as 'completed' | 'cancelled', id, cancelReason);

      // Update CustomerOrders status
      if (newStatus === 'completed') {
        await this.updateCustomerOrderStatus(orderId, 'processing'); // out for delivery
      } else {
        await this.updateCustomerOrderStatus(orderId, 'cancelled');
      }
    }

    // If this is a payment settlement, also update the payments collection
    if (updateData.paymentStatus === 'paid') {
      try {
        const dispensedDoc = await docRef.get();
        const dispensedData = dispensedDoc.data();

        // rxId is the link to payments.purchaseOrderId
        const rxId = dispensedData?.rxId;

        if (rxId) {
          const paymentSnap = await db
            .collection('payments')
            .where('purchaseOrderId', '==', rxId)
            .get();

          if (!paymentSnap.empty) {
            const batch = db.batch();
            paymentSnap.docs.forEach((doc) => {
              batch.update(doc.ref, { status: 'PAID' });
            });
            await batch.commit();
            console.log(
              `Updated ${paymentSnap.size} payment(s) for rxId: ${rxId}`,
            );
          } else {
            console.warn(`No payments found for rxId: ${rxId}`);
          }
        } else {
          console.warn('No rxId found in dispensed document:', id);
        }
        // If payment settled, try to credit loyalty points
        try {
          const userId = dispensedData?.userId || updateData?.userId;
          const patientEmail =
            dispensedData?.patientEmail || updateData?.patientEmail;
          const amount = Number(dispensedData?.total || updateData?.total || 0);
          
          let uidToCredit = userId;
          
          if (!uidToCredit && patientEmail) {
            // resolve uid from users collection if no userId is explicitly given
            const userSnap = await db
              .collection('users')
              .where('email', '==', patientEmail)
              .limit(1)
              .get();
            if (!userSnap.empty) {
              uidToCredit = userSnap.docs[0].id;
            }
          }

          if (uidToCredit && amount > 0) {
            // Use rxId as orderId when available
            const orderId = dispensedData?.rxId || id;
            await this.loyaltyService.addPurchase(uidToCredit, amount, orderId);
            console.log(
              `Credited loyalty for uid=${uidToCredit} from dispensed id=${id}`,
            );
          } else {
            console.warn(
              'Could not find userId or patientEmail when crediting loyalty (or amount is 0)',
              { userId, patientEmail, amount }
            );
          }
        } catch (err) {
          console.warn(
            'Failed to credit loyalty on dispensed payment:',
            err?.message || err,
          );
        }
      } catch (err) {
        console.warn(
          'Could not sync payment status to payments collection:',
          err.message,
        );
      }
    }

    return { id, ...updateData };
  }
}


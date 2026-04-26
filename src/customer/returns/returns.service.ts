import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../shared/firebase/firebase.service';
import { FieldValue } from 'firebase-admin/firestore';

@Injectable()
export class ReturnsService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async getReturns() {
    const db       = this.firebaseService.getDb();
    const snapshot = await db
      .collection('CustomerReturns')
      .orderBy('createdAt', 'desc')
      .get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  async submitReturn(body: any) {
    const db     = this.firebaseService.getDb();
    const docRef = await db.collection('CustomerReturns').add({
      orderId:        body.orderId        || null,
      customerName:   body.customerName   || null,
      phone:          body.phone          || null,
      address:        body.address        || null,
      items:          body.items          || [],
      refundAmount:   body.refundAmount   || 0,
      adjustmentNote: body.adjustmentNote || null,
      returnStatus:   'pending',
      refundStatus:   'pending',
      createdAt:      FieldValue.serverTimestamp(),
      processedAt:    null,
    });
    return { success: true, id: docRef.id };
  }
}
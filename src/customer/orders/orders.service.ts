import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
// ─── CHANGED: added HttpException, HttpStatus for error handling
import { FirebaseService } from '../../shared/firebase/firebase.service';
import { FieldValue } from 'firebase-admin/firestore';

@Injectable()
export class OrdersService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async createOrder(body: any) {
    // ─── UNCHANGED: createOrder is exactly the same
    try {
      const db = this.firebaseService.getDb();//connect with databse
      const orderPayload = {
        orderId:       body.orderId,
        userId:        body.userId || null,
        customerName:  `${body.firstName} ${body.lastName}`,
        email:         body.email,
        phone:         body.phone,
        address:       `${body.houseNumber}, ${body.laneStreet}, ${body.city}`,
        country:       body.country       || 'Sri Lanka',
        orderNotes:    body.orderNotes    || '',
        paymentMethod: body.paymentMethod,
        paymentStatus: body.paymentMethod === 'ONLINE' ? 'paid' : 'pending',
        orderStatus:   body.orderStatus   || 'pending',
        totalAmount:   body.totalAmount,
        types:         body.items         || [],
        createdAt:     FieldValue.serverTimestamp(),
      };
      const docRef = await db.collection('CustomerOrders').add(orderPayload);  //save to firestore about order data
      return { success: true, id: docRef.id };
    } catch (error) {
      // ─── NEW: error handling so server doesn't crash silently
      throw new HttpException(
        'Failed to create order',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ─── CHANGED: accepts optional userId to filter server-side
  async getOrders(userId?: string) {
    try {
      const db = this.firebaseService.getDb();

      // Build the base query — always ordered by createdAt descending
      let ref: FirebaseFirestore.Query = db
        .collection('CustomerOrders')
        .orderBy('createdAt', 'desc');

      // If userId is provided, filter server-side (more efficient)
      // If not provided, return all orders (frontend filters)
      if (userId) {
        ref = ref.where('userId', '==', userId);
      }

      const snapshot = await ref.get();

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // ─── NEW: normalise Firestore Timestamp to plain object
          // Firestore Admin SDK returns a Timestamp object — the frontend
         
          // Without this, createdAt?.seconds is undefined and sorting breaks.
          createdAt: data.createdAt
            ? { _seconds: data.createdAt.seconds, seconds: data.createdAt.seconds }
            : null,
        };
      });
    } catch (error) {
      // ─── NEW: error handling
      throw new HttpException(
        'Failed to fetch orders',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ─── UNCHANGED: getDeliveredOrders — just added error handling
  async getDeliveredOrders() {
    try {
      const db       = this.firebaseService.getDb();
      const snapshot = await db
        .collection('CustomerOrders')
        .where('orderStatus', '==', 'delivered')
        .get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      throw new HttpException(
        'Failed to fetch delivered orders',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ─── UNCHANGED: getProductCodeByName — just added error handling
  async getProductCodeByName(name: string) {
    try {
      const db       = this.firebaseService.getDb();
      const snapshot = await db
        .collection('products')
        .where('productName', '==', name)
        .get();
      if (snapshot.empty) return { productCode: null };
      return { productCode: snapshot.docs[0].data().productCode ?? null };
    } catch (error) {
      throw new HttpException(
        'Failed to fetch product code',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ─── UNCHANGED: handleNotify stays as placeholder
  async handleNotify(body: any) {
    return { received: true };
  }
}
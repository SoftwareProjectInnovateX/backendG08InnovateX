import { Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../../shared/firebase/firebase.service.js';
import { InternalServerErrorException } from '@nestjs/common';

const ORDERS_COLLECTION = 'CustomerOrders';

@Injectable()
export class OrdersService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async getAllOrders() {
    const db = this.firebaseService.getDb();
    try {
      const snapshot = await db
        .collection(ORDERS_COLLECTION)
        .orderBy('createdAt', 'desc')
        .get();
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (err) {
      console.warn('orderBy failed, falling back to full fetch:', err.message);
      const snapshot = await db.collection(ORDERS_COLLECTION).get();
      const allDocs = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as any[];
      return allDocs.sort((a, b) => {
        const aTime = a.createdAt?._seconds ?? a.createdAt?.seconds ?? 0;
        const bTime = b.createdAt?._seconds ?? b.createdAt?.seconds ?? 0;
        return bTime - aTime;
      });
    }
  }

  async getOrderById(id: string) {
    const db = this.firebaseService.getDb();
    const docSnap = await db.collection(ORDERS_COLLECTION).doc(id).get();
    if (!docSnap.exists) throw new NotFoundException('Order not found');
    return { id: docSnap.id, ...docSnap.data() };
  }

  async createOrder(orderPayload: any) {
    try {
      const db = this.firebaseService.getDb();
      const currentTimestamp = new Date().toISOString();

      const orderData = {
        ...orderPayload,
        date: currentTimestamp,
        createdAt: currentTimestamp,
      };

      const docRef = await db.collection(ORDERS_COLLECTION).add(orderData);

      return {
        id: docRef.id,
        ...orderData,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Order creation failed: ${error.message}`,
      );
    }
  }
}

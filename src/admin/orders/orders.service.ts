import { Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../../shared/firebase/firebase.service.js';

@Injectable()
export class OrdersService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async getAllOrders() {
    const db = this.firebaseService.getDb();
    const snapshot = await db.collection('orders').orderBy('date', 'desc').get();
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  async getOrderById(id: string) {
    const db = this.firebaseService.getDb();
    const docSnap = await db.collection('orders').doc(id).get();
    if (!docSnap.exists) throw new NotFoundException('Order not found');
    return { id: docSnap.id, ...docSnap.data() };
  }
}
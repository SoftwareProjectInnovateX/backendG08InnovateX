import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../shared/firebase/firebase.service';
import { FieldValue } from 'firebase-admin/firestore';

@Injectable()
export class OrdersService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async createOrder(body: any) {
    const db = this.firebaseService.getDb();

    const orderPayload = {
      orderId:       body.orderId,
      customerName:  `${body.firstName} ${body.lastName}`,
      email:         body.email,
      phone:         body.phone,
      address:       `${body.houseNumber}, ${body.laneStreet}, ${body.city}`,
      country:       body.country || 'Sri Lanka',
      orderNotes:    body.orderNotes || '',
      paymentMethod: body.paymentMethod,
      paymentStatus: body.paymentMethod === 'ONLINE' ? 'paid' : 'pending',
      orderStatus:   body.orderStatus || 'pending',
      totalAmount:   body.totalAmount,
      types:         body.items || [],
      createdAt:     FieldValue.serverTimestamp(),
    };

    const docRef = await db
      .collection('CustomerOrders')
      .add(orderPayload);

    return { success: true, id: docRef.id };
  }

  async getOrders() {
    const db = this.firebaseService.getDb();
    const snap = await db.collection('CustomerOrders').get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  async handleNotify(body: any) {
    return { received: true };
  }
}
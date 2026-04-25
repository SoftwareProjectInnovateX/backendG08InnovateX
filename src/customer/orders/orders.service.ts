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
      country:       body.country       || 'Sri Lanka',
      orderNotes:    body.orderNotes    || '',
      paymentMethod: body.paymentMethod,
      paymentStatus: body.paymentMethod === 'ONLINE' ? 'paid' : 'pending',
      orderStatus:   body.orderStatus   || 'pending',
      totalAmount:   body.totalAmount,
      types:         body.items         || [],
      createdAt:     FieldValue.serverTimestamp(),
    };
    const docRef = await db.collection('CustomerOrders').add(orderPayload);
    return { success: true, id: docRef.id };
  }

  async getOrders() {
    const db       = this.firebaseService.getDb();
    const snapshot = await db
      .collection('CustomerOrders')
      .orderBy('createdAt', 'desc')
      .get();
    // ✅ do NOT convert timestamps — keep raw so frontend reads _seconds same as pharmacist
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  async getDeliveredOrders() {
    const db       = this.firebaseService.getDb();
    const snapshot = await db
      .collection('CustomerOrders')
      .where('orderStatus', '==', 'delivered')
      .get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  async getProductCodeByName(name: string) {
    const db       = this.firebaseService.getDb();
    const snapshot = await db
      .collection('products')
      .where('productName', '==', name)
      .get();
    if (snapshot.empty) return { productCode: null };
    return { productCode: snapshot.docs[0].data().productCode ?? null };
  }

  async handleNotify(body: any) {
    return { received: true };
  }
}
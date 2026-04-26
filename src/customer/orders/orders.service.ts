import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../shared/firebase/firebase.service';
import { MailService } from '../../shared/mail/mail.service';
import { FieldValue } from 'firebase-admin/firestore';
import * as crypto from 'crypto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly mailService: MailService,
  ) {}

  async createOrder(body: any) {
    const db = this.firebaseService.getDb();

    const orderPayload = {
      orderId: body.orderId,
      rxId: body.rxId || null,
      isPrescription: !!body.rxId,
      customerName: `${body.firstName} ${body.lastName}`,
      email: body.email,
      phone: body.phone,
      address: `${body.houseNumber}, ${body.laneStreet}, ${body.city}`,
      country: body.country || 'Sri Lanka',
      orderNotes: body.orderNotes || '',
      paymentMethod: body.paymentMethod,
      paymentStatus: body.paymentStatus || 'pending',
      orderStatus: body.orderStatus || 'pending',
      totalAmount: parseFloat(body.totalAmount) || 0,
      total: parseFloat(body.totalAmount) || 0, // Fallback for some frontend parts
      types: body.items || [],
      createdAt: FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('CustomerOrders').add(orderPayload);

    return { success: true, id: docRef.id };
  }

  async getOrders() {
    const db = this.firebaseService.getDb();
    const snap = await db.collection('CustomerOrders').get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  async getOrderStatus(orderId: string) {
    const db = this.firebaseService.getDb();
    const snap = await db.collection('CustomerOrders').where('orderId', '==', orderId).get();
    if (snap.empty) return { status: 'NotFound' };
    return { status: snap.docs[0].data().paymentStatus };
  }

  async confirmPaymentLocally(orderId: string) {
    const db = this.firebaseService.getDb();
    const snap = await db.collection('CustomerOrders').where('orderId', '==', orderId).get();
    if (!snap.empty) {
      const orderData = snap.docs[0].data();
      await db.collection('CustomerOrders').doc(snap.docs[0].id).update({
        paymentStatus: 'paid',
        orderStatus: 'Paid'
      });

      // Send invoice email if not already sent
      if (orderData.paymentStatus !== 'paid' && orderData.email) {
        this.mailService.sendInvoiceEmail({
          to: orderData.email,
          customerName: orderData.customerName,
          orderId: orderData.orderId,
          address: orderData.address,
          phone: orderData.phone,
          totalAmount: orderData.totalAmount,
          items: orderData.types
        }).catch(err => console.error("Error sending invoice email (local):", err));
      }

      return { success: true };
    }
    return { success: false };
  }

  async handleNotify(body: any) {
    const merchantId = process.env.PAYHERE_MERCHANT_ID;
    const secret = process.env.PAYHERE_SECRET;

    if (!merchantId || !secret) {
        console.error("PayHere environment variables missing");
        return { received: false };
    }

    const orderId = body.order_id;
    const payhereAmount = body.payhere_amount;
    const payhereCurrency = body.payhere_currency;
    const statusCode = body.status_code;
    const md5sig = body.md5sig;

    const hashedSecret = crypto.createHash('md5').update(secret).digest('hex').toUpperCase();
    const hashString = merchantId + orderId + payhereAmount + payhereCurrency + statusCode + hashedSecret;
    const generatedSig = crypto.createHash('md5').update(hashString).digest('hex').toUpperCase();

    if (generatedSig === md5sig) {
      const db = this.firebaseService.getDb();
      const snap = await db.collection('CustomerOrders').where('orderId', '==', orderId).get();
      
      if (!snap.empty) {
        const docId = snap.docs[0].id;
        const orderData = snap.docs[0].data();
        let newStatus = 'pending';
        
        if (statusCode == 2) newStatus = 'paid';
        else if (statusCode < 0) newStatus = 'failed';

        await db.collection('CustomerOrders').doc(docId).update({
          paymentStatus: newStatus,
          orderStatus: newStatus === 'paid' ? 'Paid' : newStatus === 'failed' ? 'Failed' : 'Pending',
        });
        console.log(`Order ${orderId} updated to ${newStatus} via PayHere Webhook`);

        if (newStatus === 'paid' && orderData.paymentStatus !== 'paid' && orderData.email) {
          this.mailService.sendInvoiceEmail({
            to: orderData.email,
            customerName: orderData.customerName,
            orderId: orderData.orderId,
            address: orderData.address,
            phone: orderData.phone,
            totalAmount: orderData.totalAmount,
            items: orderData.types
          }).catch(err => console.error("Error sending invoice email (webhook):", err));
        }
      }
    } else {
        console.error("Invalid PayHere MD5 signature");
    }

    return { received: true };
  }
}

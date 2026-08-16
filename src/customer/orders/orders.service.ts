import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { FirebaseService } from '../../shared/firebase/firebase.service';
import { ProductsService } from '../products/products.service';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { FieldValue } from 'firebase-admin/firestore';
import { MailService } from '../../shared/mail/mail.service';
import * as crypto from 'crypto';
@Injectable()
export class OrdersService {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly productsService: ProductsService,
    private readonly loyaltyService: LoyaltyService,
    private readonly mailService: MailService,
  ) {}

  async generateHash(orderId: string, amount: string, currency: string) {
    const merchantId = process.env.PAYHERE_MERCHANT_ID;
    const secret = process.env.PAYHERE_SECRET;

    if (!merchantId || !secret) {
      throw new Error("PayHere environment variables missing");
    }

    // Security Fix: Always use the exact amount from the database, ignore frontend amount
    const db = this.firebaseService.getDb();
    const snap = await db.collection('CustomerOrders').where('orderId', '==', orderId).get();

    if (snap.empty) {
      throw new Error("Order not found");
    }

    const orderData = snap.docs[0].data();
    const actualAmount = Number(orderData.totalAmount).toFixed(2);

    const hashedSecret = crypto.createHash('md5').update(secret).digest('hex').toUpperCase();
    const hashString = merchantId + orderId + actualAmount + currency + hashedSecret;
    const hash = crypto.createHash('md5').update(hashString).digest('hex').toUpperCase();

    return { hash, merchantId, actualAmount };
  }

  private async normalizeOrderItems(items: any[]) {
    return Promise.all(
      (items || []).map(async (item: any) => {
        const category = item.category ||
          (item.productId ? await this.productsService.getProductCategory(item.productId) : '') ||
          (item.stockId ? await this.productsService.getProductCategory(item.stockId) : '');

        return {
          ...item,
          category,
        };
      })
    );
  }

  async createOrder(body: any, user: { uid: string; email?: string }) {
    try {
      const db = this.firebaseService.getDb();

      // ─── Read items from body (frontend sends field named 'items') ──────
      const rawItems = body.items || [];
      const normalizedItems = await this.normalizeOrderItems(rawItems);

      const orderPayload = {
        orderId:       body.orderId,
        userId:        user?.uid || body.userId || null,
        customerName:  `${body.firstName} ${body.lastName}`,
        email:         body.email || user?.email || null,
        phone:         body.phone,
        address:       `${body.houseNumber}, ${body.laneStreet}, ${body.city}`,
        country:       body.country       || 'Sri Lanka',
        orderNotes:    body.orderNotes    || '',
        paymentMethod: body.paymentMethod,
        paymentStatus: body.paymentMethod === 'ONLINE' ? 'paid' : 'pending',
        orderStatus:   body.orderStatus   || 'pending',
        totalAmount:   body.totalAmount,
        categories:    [...new Set(normalizedItems.map((item: any) => item.category || '').filter(Boolean))],
        types:         normalizedItems,
        createdAt:     FieldValue.serverTimestamp(),
      };

      // ─── ONLY collection updated by order placement: CustomerOrders ────
      const docRef = await db.collection('CustomerOrders').add(orderPayload);

      if (user?.uid) {
        await this.loyaltyService.addPurchase(user.uid, body.totalAmount, docRef.id);
      }

      return { success: true, id: docRef.id };

    } catch (error) {
      // ─── Log the REAL error to the terminal ──────────────────────────────
      console.error('createOrder FAILED:', error);
      throw new HttpException(
        { message: 'Failed to create order', detail: error?.message || error },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ─── UNCHANGED: getOrders ──────────────────────────────────────────────────
  async getOrders(userId?: string, email?: string) {
    try {
      const db = this.firebaseService.getDb();

      let ref: FirebaseFirestore.Query = db
        .collection('CustomerOrders')
        .orderBy('createdAt', 'desc');

      if (userId) {
        ref = ref.where('userId', '==', userId);
      } else if (email) {
        ref = ref.where('email', '==', email);
      } else {
        return [];
      }

      const snapshot = await ref.get();

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt
            ? { _seconds: data.createdAt.seconds, seconds: data.createdAt.seconds }
            : null,
        };
      });
    } catch (error) {
      console.error('❌ getOrders FAILED:', error);
      throw new HttpException(
        'Failed to fetch orders',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ─── UNCHANGED: getDeliveredOrders ────────────────────────────────────────
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
      console.error('❌ getDeliveredOrders FAILED:', error);
      throw new HttpException(
        'Failed to fetch delivered orders',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ─── UNCHANGED: getProductCodeByName ──────────────────────────────────────
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
      console.error('❌ getProductCodeByName FAILED:', error);
      throw new HttpException(
        'Failed to fetch product code',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ─── GET ORDER DETAILS ───────────────────────────────────────────────────
  async getOrderDetails(orderId: string) {
    const db = this.firebaseService.getDb();
    const snap = await db.collection('CustomerOrders').where('orderId', '==', orderId).get();
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() };
  }

  // ─── PAYHERE WEBHOOK NOTIFY ───────────────────────────────────────────────
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

        // Security Check: Verify amount matches the DB amount
        if (parseFloat(payhereAmount) !== parseFloat(orderData.totalAmount)) {
          newStatus = 'failed';
          console.error(`Security Warning: Amount mismatch for order ${orderId}. Expected ${orderData.totalAmount}, got ${payhereAmount}`);
        } else if (statusCode == 2) {
          newStatus = 'paid';
        } else if (statusCode < 0) {
          newStatus = 'failed';
        }

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

        // Handle prescription status and dispensing queue for ONLINE payments
        if (newStatus === 'paid' && orderData.rxId) {
          const rxId = orderData.rxId;
          const rxRef = db.collection('prescriptions').doc(rxId);
          const rxSnap = await rxRef.get();

          if (rxSnap.exists) {
            const rxData = rxSnap.data();
            const orderItemsForSuccess = rxData?.orderItems || rxData?.medications || [];

            const dispensedRef = db.collection('pharmacistDispensed').where('rxId', '==', rxId);
            const dispensedSnap = await dispensedRef.get();

            const dispensePayload = {
                rxId: rxId,
                patientName: orderData.customerName,
                verifiedPatient: orderData.customerName,
                phone: orderData.phone,
                address: orderData.address,
                orderItems: orderItemsForSuccess,
                total: orderData.totalAmount,
                paymentStatus: 'Paid',
                paymentMethod: 'ONLINE',
                createdAt: new Date().toISOString(),
                finalized: false
            };

            if (!dispensedSnap.empty) {
                await db.collection('pharmacistDispensed').doc(dispensedSnap.docs[0].id).update(dispensePayload);
            } else {
                await db.collection('pharmacistDispensed').add(dispensePayload);
            }

            // Update prescription status
            await rxRef.update({
                status: 'Paid',
                customerConfirmed: true,
                paymentMethod: 'ONLINE',
                confirmedAt: FieldValue.serverTimestamp(),
                customerAddress: orderData.address
            });
          }
        }
      }
    } else {
        console.error("Invalid PayHere MD5 signature");
    }

    return { received: true };
  }

  // ─── CONFIRM PAYMENT LOCALLY ───────────────────────────────────────────────
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

  // ─── settlePayment: now only updates CustomerOrders ────────────────────────
  async settlePayment(customerOrderId: string) {
    try {
      const db = this.firebaseService.getDb();

      await db.collection('CustomerOrders').doc(customerOrderId).update({
        paymentStatus:     'paid',
        paymentSettledAt:  FieldValue.serverTimestamp(),
      });

      return { success: true };

    } catch (error) {
      console.error('❌ settlePayment FAILED:', error);
      throw new HttpException(
        'Failed to settle payment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
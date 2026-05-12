import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { FirebaseService } from '../../shared/firebase/firebase.service';
import { FieldValue } from 'firebase-admin/firestore';

@Injectable()
export class OrdersService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async createOrder(body: any, user: { uid: string; email?: string }) {
    try {
      const db = this.firebaseService.getDb();

      // ─── UNCHANGED: same order payload as before ───────────────────────
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
        types:         body.items         || [],
        createdAt:     FieldValue.serverTimestamp(),
      };

      // ─── UNCHANGED: save to CustomerOrders ─────────────────────────────
      const docRef = await db.collection('CustomerOrders').add(orderPayload);

      // ─── NEW: generate a PO ID for cross-referencing ───────────────────
      const poId = `PO-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

      // ─── NEW: write to `payments` collection ──────────────────────────
      // Records the initial payment entry linked to this customer order.
      // dueDate is set 7 days from now for pending payments.
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);

      const firstItem = (body.items || [])[0];

      await db.collection('payments').add({
        amount:           body.totalAmount,
        createdAt:        FieldValue.serverTimestamp(),
        dueDate:          dueDate,
        orderId:          poId,
        paymentLabel:     body.paymentMethod === 'ONLINE'
                            ? 'Full Payment (Online)'
                            : 'Cash on Delivery',
        paymentType:      body.paymentMethod === 'ONLINE' ? 'ONLINE' : 'COD',
        productName:      firstItem?.name || '',
        purchaseOrderId:  '',                        // filled when PO doc is created below
        quantity:         (body.items || []).reduce(
                            (sum: number, i: any) => sum + (i.quantity || 1), 0
                          ),
        status:           body.paymentMethod === 'ONLINE' ? 'PAID' : 'PENDING',
        supplierId:       null,
        supplierName:     null,
        totalOrderAmount: body.totalAmount,
        // ── cross-reference fields ──
        customerOrderId:  docRef.id,                 // links back to CustomerOrders
        customerId:       user?.uid || body.userId || null,
      });

      // ─── NEW: write to `purchaseOrders` collection ────────────────────
      // Creates a purchase order entry so pharmacist can track fulfilment.
      const poRef = await db.collection('purchaseOrders').add({
        deliveredAt:            null,
        initialPaymentDate:     FieldValue.serverTimestamp(),
        initialPaymentStatus:   body.paymentMethod === 'ONLINE' ? 'PAID' : 'PENDING',
        orderDate:              FieldValue.serverTimestamp(),
        pharmacistAcknowledged: false,
        pharmacy:               body.pharmacy    || '',
        poId:                   poId,
        product:                firstItem?.name  || '',
        productId:              firstItem?.id    || '',
        quantity:               (body.items || []).reduce(
                                  (sum: number, i: any) => sum + (i.quantity || 1), 0
                                ),
        reorderLevel:           0,
        status:                 'PENDING',
        // ── cross-reference field ──
        customerOrderId:        docRef.id,           // links back to CustomerOrders
      });

      // ─── NEW: patch the payments doc with the purchaseOrderId now that we have it
      const paymentsSnap = await db
        .collection('payments')
        .where('customerOrderId', '==', docRef.id)
        .limit(1)
        .get();

      if (!paymentsSnap.empty) {
        await paymentsSnap.docs[0].ref.update({ purchaseOrderId: poRef.id });
      }

      return { success: true, id: docRef.id };

    } catch (error) {
      throw new HttpException(
        'Failed to create order',
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
        // No user identifier supplied; do not return any orders.
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
      throw new HttpException(
        'Failed to fetch product code',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ─── UNCHANGED: handleNotify ───────────────────────────────────────────────
  async handleNotify(body: any) {
    return { received: true };
  }

  // ─── NEW: settlePayment ────────────────────────────────────────────────────
  // Called by pharmacist when they confirm payment has been collected/settled.
  // Updates all three linked collections atomically:
  //   1. CustomerOrders  → paymentStatus: 'paid'
  //   2. payments        → status: 'PAID'
  //   3. purchaseOrders  → status: 'COMPLETED', deliveredAt: now
  async settlePayment(customerOrderId: string) {
    try {
      const db = this.firebaseService.getDb();

      // 1. Update CustomerOrders document
      await db.collection('CustomerOrders').doc(customerOrderId).update({
        paymentStatus:     'paid',
        paymentSettledAt:  FieldValue.serverTimestamp(),
      });

      // 2. Find and update the linked payments document
      const paymentsSnap = await db
        .collection('payments')
        .where('customerOrderId', '==', customerOrderId)
        .get();

      const paymentUpdates = paymentsSnap.docs.map(doc =>
        doc.ref.update({ status: 'PAID' })
      );
      await Promise.all(paymentUpdates);

      // 3. Find and update the linked purchaseOrders document
      const poSnap = await db
        .collection('purchaseOrders')
        .where('customerOrderId', '==', customerOrderId)
        .get();

      const poUpdates = poSnap.docs.map(doc =>
        doc.ref.update({
          status:      'COMPLETED',
          deliveredAt: FieldValue.serverTimestamp(),
        })
      );
      await Promise.all(poUpdates);

      return { success: true };

    } catch (error) {
      throw new HttpException(
        'Failed to settle payment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
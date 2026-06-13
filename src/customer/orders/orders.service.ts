import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { FirebaseService } from '../../shared/firebase/firebase.service';
import { ProductsService } from '../products/products.service';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { FieldValue } from 'firebase-admin/firestore';

@Injectable()
export class OrdersService {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly productsService: ProductsService,
    private readonly loyaltyService: LoyaltyService,
  ) {}

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

      const docRef = await db.collection('CustomerOrders').add(orderPayload);

      const poId = `PO-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);

      const firstItem = normalizedItems[0] || rawItems[0] || {};

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
        purchaseOrderId:  '',
        quantity:         rawItems.reduce(
                            (sum: number, i: any) => sum + (i.quantity || 1), 0
                          ),
        status:           body.paymentMethod === 'ONLINE' ? 'PAID' : 'PENDING',
        supplierId:       null,
        supplierName:     null,
        totalOrderAmount: body.totalAmount,
        customerOrderId:  docRef.id,
        customerId:       user?.uid || body.userId || null,
      });

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
        quantity:               rawItems.reduce(
                                  (sum: number, i: any) => sum + (i.quantity || 1), 0
                                ),
        reorderLevel:           0,
        status:                 'PENDING',
        customerOrderId:        docRef.id,
      });

      const paymentsSnap = await db
        .collection('payments')
        .where('customerOrderId', '==', docRef.id)
        .limit(1)
        .get();

      if (!paymentsSnap.empty) {
        await paymentsSnap.docs[0].ref.update({ purchaseOrderId: poRef.id });
      }

      if (user?.uid) {
        await this.loyaltyService.addPurchase(user.uid, body.totalAmount, docRef.id);
      }

      return { success: true, id: docRef.id };

    } catch (error) {
      // ─── Log the REAL error to the terminal ──────────────────────────────
      console.error('❌ createOrder FAILED:', error);
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

  // ─── UNCHANGED: handleNotify ───────────────────────────────────────────────
  async handleNotify(body: any) {
    return { received: true };
  }

  // ─── UNCHANGED: settlePayment ─────────────────────────────────────────────
  async settlePayment(customerOrderId: string) {
    try {
      const db = this.firebaseService.getDb();

      await db.collection('CustomerOrders').doc(customerOrderId).update({
        paymentStatus:     'paid',
        paymentSettledAt:  FieldValue.serverTimestamp(),
      });

      const paymentsSnap = await db
        .collection('payments')
        .where('customerOrderId', '==', customerOrderId)
        .get();

      const paymentUpdates = paymentsSnap.docs.map(doc =>
        doc.ref.update({ status: 'PAID' })
      );
      await Promise.all(paymentUpdates);

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
      console.error('❌ settlePayment FAILED:', error);
      throw new HttpException(
        'Failed to settle payment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
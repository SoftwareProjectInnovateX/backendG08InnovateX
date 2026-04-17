import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { FirebaseService } from '../../shared/firebase/firebase.service';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  addDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';

@Injectable()
export class PurchaseOrdersService {
  private db;

  constructor(private readonly firebaseService: FirebaseService) {
    this.firebaseService.getDb();
  }

  // ─── GET ORDERS 
  async getOrders(supplierId: string, status?: string) {
    try {
      const ordersRef = collection(this.db, 'purchaseOrders');

      const q =
        !status || status === 'All Orders'
          ? query(
              ordersRef,
              where('supplierId', '==', supplierId),
              orderBy('createdAt', 'desc'),
            )
          : query(
              ordersRef,
              where('supplierId', '==', supplierId),
              where('status', '==', status),
              orderBy('createdAt', 'desc'),
            );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (error) {
      throw new BadRequestException('Error loading orders: ' + error.message);
    }
  }

  // ─── GET SINGLE ORDER 
  async getOrderById(orderId: string) {
    const orderRef = doc(this.db, 'purchaseOrders', orderId);
    const orderSnap = await getDoc(orderRef);
    if (!orderSnap.exists()) {
      throw new NotFoundException('Order not found');
    }
    return { id: orderSnap.id, ...orderSnap.data() };
  }

  // ─── APPROVE ORDER 
  async approveOrder(
    orderId: string,
    supplierId: string,
    supplierName: string,
  ) {
    // 1. Fetch the purchase order
    const orderRef = doc(this.db, 'purchaseOrders', orderId);
    const orderSnap = await getDoc(orderRef);
    if (!orderSnap.exists()) throw new NotFoundException('Order not found');

    const order = orderSnap.data() as any;

    // 2. Verify supplier owns this order
    if (order.supplierId !== supplierId) {
      throw new BadRequestException('Unauthorized: order does not belong to this supplier');
    }

    if (order.status !== 'PENDING') {
      throw new BadRequestException('Order is not in PENDING status');
    }

    // 3. Fetch supplier product
    const productRef = doc(this.db, 'products', order.productId);
    const productSnap = await getDoc(productRef);
    if (!productSnap.exists()) {
      throw new NotFoundException('Product not found in supplier inventory');
    }

    const currentSupplierMinStock: number = productSnap.data().minStock ?? 0;

    // 4. Guard: check remaining stock
    if (currentSupplierMinStock < order.quantity) {
      throw new BadRequestException(
        `Insufficient remaining stock! Required: ${order.quantity}, Available: ${currentSupplierMinStock}`,
      );
    }

    // 5. Update purchase order status → APPROVED
    await updateDoc(orderRef, {
      status: 'APPROVED',
      approvedAt: Timestamp.now(),
      approvalDate: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    // 6. Update supplier product (products collection)
    //    minStock (Remaining Stock) → DECREMENT
    await updateDoc(productRef, {
      minStock: currentSupplierMinStock - order.quantity,
      updatedAt: Timestamp.now(),
    });

    // 7. Update admin product (adminProducts collection)
    if (order.adminProductId) {
      const adminProductRef = doc(this.db, 'adminProducts', order.adminProductId);
      const adminProductSnap = await getDoc(adminProductRef);
      if (adminProductSnap.exists()) {
        const currentAdminStock: number = adminProductSnap.data().stock ?? 0;
        await updateDoc(adminProductRef, {
          stock: currentAdminStock + order.quantity,
          minStock: currentSupplierMinStock - order.quantity,
          availability: 'in stock',
          lastRestocked: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
      }
    }

    // 8. Create payment record (initial 50%)
    const totalAmount = Number(order.amount ?? order.totalAmount);
    const initialPaymentDueDate = Timestamp.fromDate(
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    );

    await addDoc(collection(this.db, 'payments'), {
      orderId: order.poId,
      purchaseOrderId: orderId,
      supplierName,
      supplierId,
      productName: order.product ?? order.productName,
      quantity: order.quantity,
      amount: totalAmount * 0.5,
      totalOrderAmount: totalAmount,
      paymentType: 'INITIAL',
      paymentLabel: 'Initial Payment (50%)',
      status: 'PENDING',
      adminProductId: order.adminProductId,
      dueDate: initialPaymentDueDate,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    // 9. Create invoice record
    await addDoc(collection(this.db, 'invoices'), {
      purchaseOrderId: orderId,
      orderId: order.poId,
      invoiceNumber: `INV-${order.poId}-INITIAL`,
      pharmacy: 'MediCareX',
      supplierId,
      supplierName,
      productName: order.product ?? order.productName,
      adminProductId: order.adminProductId,
      quantity: order.quantity,
      invoiceType: 'INITIAL',
      invoiceLabel: 'Initial Payment (50%)',
      items: [
        {
          productName: order.product ?? order.productName,
          quantity: order.quantity,
          unitPrice: Number(order.unitPrice ?? 0),
        },
      ],
      subtotal: totalAmount * 0.5,
      taxRate: 0,
      taxAmount: 0,
      totalAmount: totalAmount * 0.5,
      totalOrderAmount: totalAmount,
      paymentStatus: 'Pending',
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: initialPaymentDueDate.toDate().toISOString().split('T')[0],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    // 10. Notify admin
    await addDoc(collection(this.db, 'notifications'), {
      type: 'ORDER_APPROVED',
      recipientId: 'admin',
      recipientType: 'admin',
      orderId,
      poId: order.poId,
      supplierId,
      supplierName,
      productName: order.product ?? order.productName,
      quantity: order.quantity,
      totalAmount: order.amount ?? order.totalAmount,
      adminProductId: order.adminProductId,
      message: `Order Approved: ${supplierName} approved order ${order.poId} for ${order.quantity} units of ${order.product ?? order.productName}`,
      read: false,
      createdAt: Timestamp.now(),
    });

    return {
      success: true,
      message: 'Order approved successfully',
      orderId,
    };
  }

  // ─── REJECT ORDER 
  async rejectOrder(
    orderId: string,
    supplierId: string,
    supplierName: string,
    rejectReason: string,
  ) {
    if (!rejectReason?.trim()) {
      throw new BadRequestException('Rejection reason is required');
    }

    // 1. Fetch the purchase order
    const orderRef = doc(this.db, 'purchaseOrders', orderId);
    const orderSnap = await getDoc(orderRef);
    if (!orderSnap.exists()) throw new NotFoundException('Order not found');

    const order = orderSnap.data() as any;

    if (order.supplierId !== supplierId) {
      throw new BadRequestException('Unauthorized: order does not belong to this supplier');
    }

    if (order.status !== 'PENDING') {
      throw new BadRequestException('Order is not in PENDING status');
    }

    // 2. Update purchase order status → REJECTED
    await updateDoc(orderRef, {
      status: 'REJECTED',
      rejectedAt: Timestamp.now(),
      rejectionReason: rejectReason,
      rejectionDate: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    // 3. Notify admin
    await addDoc(collection(this.db, 'notifications'), {
      type: 'ORDER_REJECTED',
      recipientId: 'admin',
      recipientType: 'admin',
      orderId,
      poId: order.poId,
      supplierId,
      supplierName,
      productName: order.product ?? order.productName,
      quantity: order.quantity,
      totalAmount: order.amount ?? order.totalAmount,
      rejectionReason: rejectReason,
      message: `Order Rejected: ${supplierName} rejected order ${order.poId} - Reason: ${rejectReason}`,
      read: false,
      createdAt: Timestamp.now(),
    });

    return {
      success: true,
      message: 'Order rejected successfully',
      orderId,
    };
  }
}

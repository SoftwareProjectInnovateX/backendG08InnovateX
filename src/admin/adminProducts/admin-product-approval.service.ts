// admin-product-approval.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../../shared/firebase/firebase.service.js';
import { CountersService } from '../../shared/counters/counters.service.js';
import { Timestamp } from 'firebase-admin/firestore';
import { MailService } from '../../shared/mail/mail.service.js';

@Injectable()
export class AdminProductApprovalService {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly countersService: CountersService,
    private readonly mailService: MailService,
  ) {}

  // ── GET /admin/pending-products
  // Pending items now live in 'products' collection with status: 'pending'
  async getAllPending() {
    const db = this.firebaseService.getDb();

    const snapshot = await db
      .collection('products')
      .where('status', '==', 'pending')
      .get();

    const products = snapshot.docs.map((d) => {
      const data = d.data();

      return {
        id: d.id,
        ...data,
        createdAt: data.createdAt
          ? { _seconds: data.createdAt.seconds }
          : null,
        approvedAt: data.approvedAt
          ? { _seconds: data.approvedAt.seconds }
          : null,
        rejectedAt: data.rejectedAt
          ? { _seconds: data.rejectedAt.seconds }
          : null,
      };
    });

    // Sort newest first without requiring Firestore composite index
    return products.sort((a: any, b: any) => {
      const aTime = a.createdAt?._seconds ?? 0;
      const bTime = b.createdAt?._seconds ?? 0;

      return bTime - aTime;
    });
  }

  // ── PATCH /admin/pending-products/:id/approve
  async approveProduct(productId: string) {
    const db = this.firebaseService.getDb();

    const productRef = db
      .collection('products')
      .doc(productId);

    const productSnap = await productRef.get();

    if (!productSnap.exists) {
      throw new NotFoundException('Product not found');
    }

    const data = productSnap.data()!;

    const productCode =
      await this.countersService.generateProductCode();

    const suppliedStock = data.stock ?? 0;
    const remainingStock = data.minStock ?? 0;

    const availability =
      suppliedStock > 0
        ? 'in stock'
        : 'out of stock';

    // Update the live products doc — mark as approved
    await productRef.update({
      status: 'approved',
      productCode,
      availability,
      approvedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    // Update the matching adminProducts doc — mark as approved
    const adminSnap = await db
      .collection('adminProducts')
      .where('productId', '==', productId)
      .get();

    if (!adminSnap.empty) {
      await db
        .collection('adminProducts')
        .doc(adminSnap.docs[0].id)
        .update({
          status: 'approved',
          productCode,
          retailPrice:
            (data.wholesalePrice ?? 0) * 1.2,
          availability,
          lastRestocked: Timestamp.now(),
          approvedAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
    }

    // Log the approved product into pendingProducts (audit trail only)
    await db.collection('pendingProducts').add({
      productId: productRef.id,
      supplierId: data.supplierId,
      supplierName: data.supplierName,
      productName: data.productName,
      productCode,
      category: data.category,
      wholesalePrice: data.wholesalePrice,
      stock: suppliedStock,
      minStock: remainingStock,
      description: data.description || '',
      manufacturer: data.manufacturer || '',
      status: 'approved',
      createdAt:
        data.createdAt || Timestamp.now(),
      approvedAt: Timestamp.now(),
    });

    // Notify supplier
    await db.collection('notifications').add({
      type: 'PRODUCT_APPROVED',
      recipientId: data.supplierId,
      recipientType: 'supplier',
      supplierId: data.supplierId,
      productId,
      productName: data.productName,
      productCode,

      message:
        `Your product "${data.productName}" (${productCode}) has been approved and added to the inventory.`,

      read: false,
      createdAt: Timestamp.now(),
    });

    // ✅ Fixed: use data.supplierEmail for the `to` field
    if (data.supplierEmail) {
      await this.mailService.sendProductApprovedEmail({
        to: data.supplierEmail,
        supplierName: data.supplierName,
        productName: data.productName,
        productCode,
      });
    } else {
      console.warn(
        `[ApproveProduct] No supplierEmail found for supplierId: ${data.supplierId}. Email not sent.`,
      );
    }

    return {
      success: true,
      productId,
      productCode,
    };
  }

  // ── PATCH /admin/pending-products/:id/reject
  async rejectProduct(
    productId: string,
    reason?: string,
  ) {
    const db = this.firebaseService.getDb();

    const productRef = db
      .collection('products')
      .doc(productId);

    const productSnap = await productRef.get();

    if (!productSnap.exists) {
      throw new NotFoundException('Product not found');
    }

    const data = productSnap.data()!;

    // Update the live products doc — mark as rejected
    await productRef.update({
      status: 'rejected',
      rejectedAt: Timestamp.now(),
      rejectionReason: reason || '',
      updatedAt: Timestamp.now(),
    });

    // Update the matching adminProducts doc — mark as rejected
    const adminSnap = await db
      .collection('adminProducts')
      .where('productId', '==', productId)
      .get();

    if (!adminSnap.empty) {
      await db
        .collection('adminProducts')
        .doc(adminSnap.docs[0].id)
        .update({
          status: 'rejected',
          rejectedAt: Timestamp.now(),
          rejectionReason: reason || '',
          updatedAt: Timestamp.now(),
        });
    }

    // pendingProducts is intentionally NOT updated on rejection

    // Notify supplier
    await db.collection('notifications').add({
      type: 'PRODUCT_REJECTED',
      recipientId: data.supplierId,
      recipientType: 'supplier',
      supplierId: data.supplierId,
      productId,
      productName: data.productName,
      rejectionReason: reason || '',

      message:
        `Your product "${data.productName}" was not approved.${
          reason
            ? ' Reason: ' + reason
            : ''
        }`,

      read: false,
      createdAt: Timestamp.now(),
    });

    // ✅ Fixed: use data.supplierEmail for the `to` field
    if (data.supplierEmail) {
      await this.mailService.sendProductRejectedEmail({
        to: data.supplierEmail,
        supplierName: data.supplierName,
        productName: data.productName,
        reason,
      });
    } else {
      console.warn(
        `[RejectProduct] No supplierEmail found for supplierId: ${data.supplierId}. Email not sent.`,
      );
    }

    return {
      success: true,
    };
  }
}

import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../shared/firebase/firebase.service.js';
import { CountersService } from '../../shared/counters/counters.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { Timestamp } from 'firebase-admin/firestore';

@Injectable()
export class SupplierProductsService {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly countersService: CountersService,
  ) {}

  // ── GET /supplier/products
  async getProducts(supplierId: string) {
    const db = this.firebaseService.getDb();

    const snapshot = await db
      .collection('products')
      .where('supplierId', '==', supplierId)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  // ── GET /supplier/products/pending?supplierId=xxx
  async getPendingProducts(supplierId: string) {
    const db = this.firebaseService.getDb();

    const snapshot = await db
      .collection('pendingProducts')
      .where('supplierId', '==', supplierId)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  // ── POST /supplier/products
  // Now saves to `pendingProducts` and waits for admin approval
  async createProduct(
    supplierId: string,
    supplierName: string,
    dto: CreateProductDto,
  ) {
    const db = this.firebaseService.getDb();

    const suppliedStock = dto.stock ?? 0;
    const remainingStock = dto.minStock ?? 0;

    const pendingProduct = {
      productName: dto.productName,
      category: dto.category,
      wholesalePrice: dto.wholesalePrice,
      stock: suppliedStock,
      minStock: remainingStock,
      description: dto.description || '',
      manufacturer: dto.manufacturer || '',
      supplierId,
      supplierName,
      status: 'pending',          // admin must approve
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const pendingRef = await db.collection('pendingProducts').add(pendingProduct);

    // Notify admin about new product awaiting approval
    await db.collection('notifications').add({
      type: 'PRODUCT_PENDING_APPROVAL',
      recipientType: 'admin',
      pendingProductId: pendingRef.id,
      productName: dto.productName,
      supplierId,
      supplierName,
      message: `New product "${dto.productName}" submitted by ${supplierName} — awaiting approval.`,
      read: false,
      createdAt: Timestamp.now(),
    });

    return { pendingProductId: pendingRef.id, status: 'pending' };
  }

  // ── PATCH /supplier/products/:id
  async updateProduct(productId: string, dto: UpdateProductDto) {
    const db = this.firebaseService.getDb();

    const suppliedStock = dto.stock ?? 0;
    const remainingStock = dto.minStock ?? 0;

    const updatedData = {
      ...(dto.productName && { productName: dto.productName }),
      ...(dto.category && { category: dto.category }),
      ...(dto.wholesalePrice && { wholesalePrice: dto.wholesalePrice }),
      stock: suppliedStock,
      minStock: remainingStock,
      description: dto.description ?? '',
      manufacturer: dto.manufacturer ?? '',
      availability: remainingStock > 0 ? 'in stock' : 'out of stock',
      updatedAt: Timestamp.now(),
    };

    await db.collection('products').doc(productId).update(updatedData);

    const adminSnap = await db
      .collection('adminProducts')
      .where('productId', '==', productId)
      .get();

    if (!adminSnap.empty) {
      await db
        .collection('adminProducts')
        .doc(adminSnap.docs[0].id)
        .update({
          ...updatedData,
          ...(dto.wholesalePrice && { retailPrice: dto.wholesalePrice * 1.2 }),
        });
    }

    return { success: true };
  }

  // ── DELETE /supplier/products/:id
  async deleteProduct(productId: string) {
    const db = this.firebaseService.getDb();

    await db.collection('products').doc(productId).delete();

    const adminSnap = await db
      .collection('adminProducts')
      .where('productId', '==', productId)
      .get();

    if (!adminSnap.empty) {
      await db
        .collection('adminProducts')
        .doc(adminSnap.docs[0].id)
        .delete();
    }

    return { success: true };
  }

  // ── POST /supplier/products/pending/:id/approve  (called by admin service — see AdminProductApprovalService)
  // Moved to AdminProductApprovalService for separation of concerns
}
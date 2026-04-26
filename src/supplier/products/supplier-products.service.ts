// supplier-products.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../../shared/firebase/firebase.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Timestamp } from 'firebase-admin/firestore';

@Injectable()
export class SupplierProductsService {
  constructor(private readonly firebaseService: FirebaseService) {}

  // ── GET /supplier/products?supplierId=xxx
  // Returns only APPROVED products (live in 'products' collection)
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
  // Returns pending AND rejected submissions from 'pendingProducts' collection
  async getPendingProducts(supplierId: string) {
    const db = this.firebaseService.getDb();

    const snapshot = await db
      .collection('products')
      .where('supplierId', '==', supplierId)
      .where('status', '==', 'pending')
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        createdAt: data.createdAt ? { _seconds: data.createdAt.seconds } : null,
        approvedAt: data.approvedAt
          ? { _seconds: data.approvedAt.seconds }
          : null,
        rejectedAt: data.rejectedAt
          ? { _seconds: data.rejectedAt.seconds }
          : null,
      };
    });
  }

  // ── POST /supplier/products
  // Saves to 'pendingProducts' with status: 'pending'
  // Admin will move it to 'products' + 'adminProducts' upon approval
  async createProduct(
    supplierId: string,
    supplierName: string,
    dto: CreateProductDto,
  ) {
    const db = this.firebaseService.getDb();

    const suppliedStock = dto.stock || 0;
    const remainingStock = dto.minStock || 0;

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
      status: 'pending',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await db.collection('pendingProducts').add(pendingProduct);

    return { success: true, pendingProductId: docRef.id };
  }

  // ── PATCH /supplier/products/:id
  // Only approved products (in 'products' collection) can be edited
  async updateProduct(productId: string, dto: UpdateProductDto) {
    const db = this.firebaseService.getDb();

    const productRef = db.collection('products').doc(productId);
    const productSnap = await productRef.get();

    if (!productSnap.exists) {
      throw new NotFoundException('Product not found');
    }

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
      availability: suppliedStock > 0 ? 'in stock' : 'out of stock',
      updatedAt: Timestamp.now(),
    };

    await productRef.update(updatedData);

    // Keep adminProducts in sync
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
  // Only approved products can be deleted
  async deleteProduct(productId: string) {
    const db = this.firebaseService.getDb();

    await db.collection('products').doc(productId).delete();

    // Remove from adminProducts too
    const adminSnap = await db
      .collection('adminProducts')
      .where('productId', '==', productId)
      .get();

    if (!adminSnap.empty) {
      await db.collection('adminProducts').doc(adminSnap.docs[0].id).delete();
    }

    return { success: true };
  }
}

import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../shared/firebase/firebase.service';
import { CountersService } from '../../shared/counters/counters.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
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

    const snapshot = await db.collection('products')
      .where('supplierId', '==', supplierId)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  // ── GET /supplier/products/pending
  async getPendingProducts(supplierId: string) {
    const db = this.firebaseService.getDb();

    const snapshot = await db.collection('products')
      .where('supplierId', '==', supplierId)
      .where('status', '==', 'pending')
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  // ── POST /supplier/products
  async createProduct(supplierId: string, supplierName: string, dto: CreateProductDto) {
    const db = this.firebaseService.getDb();

    const productCode = await this.countersService.generateProductCode();

    const suppliedStock  = dto.stock    || 0;
    const remainingStock = dto.minStock || 0;

    const newProduct = {
      productName:    dto.productName,
      productCode,
      category:       dto.category,
      wholesalePrice: dto.wholesalePrice,
      stock:          suppliedStock,
      minStock:       remainingStock,
      description:    dto.description  || '',
      manufacturer:   dto.manufacturer || '',
      availability:   remainingStock > 0 ? 'in stock' : 'out of stock',
      status:         'pending',
      supplierId,
      supplierName,
      createdAt:      Timestamp.now(),
      updatedAt:      Timestamp.now(),
    };

    const productRef = await db.collection('products').add(newProduct);

    await db.collection('adminProducts').add({
      productId:      productRef.id,
      supplierId,
      supplierName,
      productName:    dto.productName,
      productCode,
      category:       dto.category,
      wholesalePrice: dto.wholesalePrice,
      retailPrice:    (dto.wholesalePrice ?? 0) * 1.2,
      stock:          suppliedStock,
      minStock:       remainingStock,
      description:    dto.description  || '',
      manufacturer:   dto.manufacturer || '',
      availability:   remainingStock > 0 ? 'in stock' : 'out of stock',
      status:         'pending',
      lastRestocked:  Timestamp.now(),
      createdAt:      Timestamp.now(),
      updatedAt:      Timestamp.now(),
    });

    return { productId: productRef.id, productCode };
  }

  // ── PATCH /supplier/products/:id
  async updateProduct(productId: string, dto: UpdateProductDto) {
    const db = this.firebaseService.getDb();

    const suppliedStock  = dto.stock    ?? 0;
    const remainingStock = dto.minStock ?? 0;

    const updatedData = {
      ...(dto.productName    && { productName:    dto.productName }),
      ...(dto.category       && { category:       dto.category }),
      ...(dto.wholesalePrice && { wholesalePrice: dto.wholesalePrice }),
      stock:        suppliedStock,
      minStock:     remainingStock,
      description:  dto.description  ?? '',
      manufacturer: dto.manufacturer ?? '',
      availability: remainingStock > 0 ? 'in stock' : 'out of stock',
      updatedAt:    Timestamp.now(),
    };

    await db.collection('products').doc(productId).update(updatedData);

    const adminSnap = await db.collection('adminProducts')
      .where('productId', '==', productId)
      .get();

    if (!adminSnap.empty) {
      await db.collection('adminProducts').doc(adminSnap.docs[0].id).update({
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

    const adminSnap = await db.collection('adminProducts')
      .where('productId', '==', productId)
      .get();

    if (!adminSnap.empty) {
      await db.collection('adminProducts').doc(adminSnap.docs[0].id).delete();
    }

    return { success: true };
  }
}
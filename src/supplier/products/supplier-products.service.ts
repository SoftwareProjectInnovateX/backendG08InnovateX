import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../shared/firebase/firebase.service';
import { CountersService } from '../../shared/counters/counters.service';
import { SearchService } from '../../shared/search/search.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Timestamp } from 'firebase-admin/firestore';

@Injectable()
export class SupplierProductsService {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly countersService: CountersService,
    private readonly searchService: SearchService,
  ) {}

  // ── GET /supplier/products ────────────────────────────────────────────────
  async getProducts(supplierId: string) {
    const db = this.firebaseService.getDb();

    const snapshot = await db
      .collection('products')
      .where('supplierId', '==', supplierId)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  // ── POST /supplier/products ───────────────────────────────────────────────
  async createProduct(
    supplierId: string,
    supplierName: string,
    dto: CreateProductDto,
  ) {
    const db = this.firebaseService.getDb();

    const productCode = await this.countersService.generateProductCode();

    const suppliedStock = dto.stock || 0;
    const remainingStock = dto.minStock || 0;

    const newProduct = {
      productName: dto.productName,
      productCode,
      category: dto.category,
      wholesalePrice: dto.wholesalePrice,
      stock: suppliedStock,
      minStock: remainingStock,
      description: dto.description || '',
      manufacturer: dto.manufacturer || '',
      availability: remainingStock > 0 ? 'in stock' : 'out of stock',
      supplierId,
      supplierName,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const productRef = await db.collection('products').add(newProduct);

    const adminRef = await db.collection('adminProducts').add({
      productId: productRef.id,
      supplierId,
      supplierName,
      productName: dto.productName,
      productCode,
      category: dto.category,
      wholesalePrice: dto.wholesalePrice,
      retailPrice: (dto.wholesalePrice ?? 0) * 1.2,
      stock: suppliedStock,
      minStock: remainingStock,
      description: dto.description || '',
      manufacturer: dto.manufacturer || '',
      availability: remainingStock > 0 ? 'in stock' : 'out of stock',
      lastRestocked: Timestamp.now(),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    await this.searchService.upsertProductToIndex(adminRef.id, {
      id: adminRef.id,
      productName: dto.productName,
      description: dto.description ?? '',
      category: dto.category,
      manufacturer: dto.manufacturer ?? '',
      availability: remainingStock > 0 ? 'in stock' : 'out of stock',
      similarityScore: 0,
      searchSource: 'supplier',
    });

    return { productId: productRef.id, productCode };
  }
  // ── PATCH /supplier/products/:id ─────────────────────────────────────────
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
      const adminDocId = adminSnap.docs[0].id; // ✅ FIX

      await db
        .collection('adminProducts')
        .doc(adminDocId)
        .update({
          ...updatedData,
          ...(dto.wholesalePrice && {
            retailPrice: dto.wholesalePrice * 1.2,
          }),
        });

      await this.searchService.upsertProductToIndex(adminDocId, {
        id: adminDocId,
        productName: dto.productName ?? '',
        description: dto.description ?? '',
        category: dto.category ?? '',
        manufacturer: dto.manufacturer ?? '',
        availability: remainingStock > 0 ? 'in stock' : 'out of stock',
        similarityScore: 0,
        searchSource: 'supplier',
      });
    }

    return { success: true };
  }

  // ── DELETE /supplier/products/:id ────────────────────────────────────────
  async deleteProduct(productId: string) {
    const db = this.firebaseService.getDb();

    await db.collection('products').doc(productId).delete();

    const adminSnap = await db
      .collection('adminProducts')
      .where('productId', '==', productId)
      .get();

    if (!adminSnap.empty) {
      const adminDocId = adminSnap.docs[0].id;

      await db.collection('adminProducts').doc(adminDocId).delete();

      await this.searchService.removeProductFromIndex(adminDocId);
    }

    return { success: true };
  }
}

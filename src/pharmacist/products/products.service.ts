import { Injectable, BadRequestException } from '@nestjs/common';
import { FirebaseService } from '../../shared/firebase/firebase.service';
import { FieldValue } from 'firebase-admin/firestore';

const VALID_VISIBILITY = ['customer', 'pharmacist_only'] as const;
type Visibility = (typeof VALID_VISIBILITY)[number];

@Injectable()
export class ProductsService {
  constructor(private readonly firebaseService: FirebaseService) {}

  // ── Read from pendingProducts (not products) ──────────────────────────────
  async getPendingProducts() {
    const db = this.firebaseService.getDb();
    const snapshot = await db
      .collection('pendingProducts') // ✅ fixed collection
      .get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async getAllPharmacistProducts() {
    const db = this.firebaseService.getDb();
    const snapshot = await db.collection('pharmacistProducts').get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async getCustomerProducts() {
    const db = this.firebaseService.getDb();
    try {
      const snapshot = await db
        .collection('pharmacistProducts')
        .where('visibility', '==', 'customer')
        .get();

      const productList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log('pharmacistProducts fetched:', productList.length);

      const stockSnapshot = await db.collection('products').get();
      const stockMap: Record<string, number> = {};
      stockSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        stockMap[data.productCode || doc.id] = data.stock ?? 0;
      });

      return productList.map((p) => {
        const stockId = (p as any).stockId;
        const productCode = (p as any).productCode;
        return {
          ...p,
          stock: stockMap[stockId] ?? stockMap[productCode] ?? 0,
        };
      });
    } catch (err) {
      console.error('getCustomerProducts ERROR:', err);
      throw err;
    }
  }

  // ── Delete from pendingProducts so it disappears from the list ────────────
  async approvePending(id: string) {
    const db = this.firebaseService.getDb();
    await db.collection('pendingProducts').doc(id).delete(); // ✅ fixed
    return { success: true, id };
  }

  async addProduct(body: any) {
    const db = this.firebaseService.getDb();

    const visibility: Visibility = VALID_VISIBILITY.includes(body.visibility)
      ? body.visibility
      : 'customer';

    const productPayload: any = {
      name: body.name,
      nameLowercase: body.name ? body.name.toLowerCase() : '',
      price: Number(body.price),
      description: body.description ?? '',
      imageUrl: body.imageUrl ?? '',
      category: body.category ?? '',
      supplierId: body.supplierId ?? '',
      stockId: body.stockId ?? '',
      retailPrice: Number(body.price),
      tags: body.tags ?? [],
      visibility,
      status: 'active',
      createdAt: FieldValue.serverTimestamp(),
    };
    if (body.expireDate) {
      productPayload.expireDate = new Date(body.expireDate);
    }
    const docRef = await db
      .collection('pharmacistProducts')
      .add(productPayload);

    const adminPayload: any = {
      productId: docRef.id,
      supplierId: body.supplierId ?? '',
      supplierName: 'Pharmacist (Manual Add)',
      productName: body.name,
      productCode: body.stockId ?? '',
      category: body.category ?? '',
      wholesalePrice: Number(body.price) / 1.2,
      retailPrice: Number(body.price),
      stock: body.stock ? Number(body.stock) : 0,
      minStock: 10,
      description: body.description ?? '',
      manufacturer: 'Unknown',
      availability: 'out of stock',
      createdAt: FieldValue.serverTimestamp(),
      lastRestocked: FieldValue.serverTimestamp(),
    };
    if (body.expireDate) {
      adminPayload.expireDate = new Date(body.expireDate);
    }
    await db.collection('adminProducts').add(adminPayload);

    // If visibility is 'customer', add to the public 'products' collection so customers can see it
    if (visibility === 'customer') {
      const publicProductPayload: any = {
        name: body.name,
        nameLowercase: body.name ? body.name.toLowerCase() : '',
        price: Number(body.price),
        description: body.description ?? '',
        imageUrl: body.imageUrl ?? '',
        category: body.category ?? '',
        supplierId: body.supplierId ?? '',
        stockId: body.stockId ?? '',
        retailPrice: Number(body.price),
        tags: body.tags ?? [],
        visibility,
        status: 'active',
        createdAt: FieldValue.serverTimestamp(),
      };
      if (body.expireDate) {
        publicProductPayload.expireDate = new Date(body.expireDate);
      }
      await db.collection('products').doc(docRef.id).set(publicProductPayload);
    }

    return { success: true, id: docRef.id, visibility };
  }

  async updateVisibility(id: string, visibility: string) {
    if (!VALID_VISIBILITY.includes(visibility as Visibility)) {
      throw new BadRequestException(
        `Invalid visibility. Must be one of: ${VALID_VISIBILITY.join(', ')}`,
      );
    }

    const db = this.firebaseService.getDb();
    await db.collection('pharmacistProducts').doc(id).update({ visibility });

    return { success: true, id, visibility };
  }

  async getProducts(category?: string) {
    return this.getCustomerProducts();
  }

  private async findProductDoc(productCode: string) {
    const db = this.firebaseService.getDb();

    if (!productCode?.trim()) return null;

    const codeSnap = await db
      .collection('products')
      .where('productCode', '==', productCode)
      .get();
    if (!codeSnap.empty) return codeSnap.docs[0];

    const directDoc = await db.collection('products').doc(productCode).get();
    if (directDoc.exists) return directDoc;

    const pharmDoc = await db
      .collection('pharmacistProducts')
      .doc(productCode)
      .get();
    if (pharmDoc.exists) {
      const stockId = pharmDoc.data()?.stockId;
      if (stockId) {
        const stockSnap = await db
          .collection('products')
          .where('productCode', '==', stockId)
          .get();
        if (!stockSnap.empty) return stockSnap.docs[0];
      }
    }

    const altPharmSnap = await db
      .collection('pharmacistProducts')
      .where('stockId', '==', productCode)
      .get();
    if (!altPharmSnap.empty) {
      const altStockId = altPharmSnap.docs[0].data()?.stockId;
      if (altStockId) {
        const stockSnap = await db
          .collection('products')
          .where('productCode', '==', altStockId)
          .get();
        if (!stockSnap.empty) return stockSnap.docs[0];
      }
    }

    return null;
  }

  async decrementStock(productCode: string, quantity: number) {
    if (!quantity || quantity <= 0 || !Number.isInteger(quantity)) {
      return { success: false, message: 'Invalid quantity' };
    }

    const db = this.firebaseService.getDb();
    const productDoc = await this.findProductDoc(productCode);
    if (!productDoc) {
      return { success: false, message: 'Product not found' };
    }

    let before = 0;
    let after = 0;
    await db.runTransaction(async (transaction) => {
      const docSnap = await transaction.get(productDoc.ref);
      before = docSnap.data()?.stock ?? 0;
      after = Math.max(0, before - quantity);
      transaction.update(productDoc.ref, { stock: after });
    });

    await this.updateAdminProductStock(productDoc.id, -quantity);
    return { success: true, productCode, before, after };
  }

  async incrementStock(productCode: string, quantity: number) {
    if (!quantity || quantity <= 0 || !Number.isInteger(quantity)) {
      return { success: false, message: 'Invalid quantity' };
    }

    const db = this.firebaseService.getDb();
    const productDoc = await this.findProductDoc(productCode);
    if (!productDoc) {
      return { success: false, message: 'Product not found' };
    }

    let before = 0;
    let after = 0;
    await db.runTransaction(async (transaction) => {
      const docSnap = await transaction.get(productDoc.ref);
      before = docSnap.data()?.stock ?? 0;
      after = before + quantity;
      transaction.update(productDoc.ref, { stock: after });
    });

    await this.updateAdminProductStock(productDoc.id, quantity);
    return { success: true, productCode, before, after };
  }

  private async updateAdminProductStock(
    productDocId: string,
    quantity: number,
  ) {
    const db = this.firebaseService.getDb();
    const adminSnap = await db
      .collection('adminProducts')
      .where('productId', '==', productDocId)
      .get();

    if (!adminSnap.empty) {
      const adminStock = adminSnap.docs[0].data().stock ?? 0;
      await adminSnap.docs[0].ref.update({
        stock: Math.max(0, adminStock + quantity),
      });
    }
  }
}

import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../shared/firebase/firebase.service';
import { FieldValue } from 'firebase-admin/firestore';

@Injectable()
export class ProductsService {
  constructor(private readonly firebaseService: FirebaseService) {}

  private productsCache:     { data: any[];                  ts: number } | null = null;
  private stockCache:        { data: Record<string, number>; ts: number } | null = null;
  private readonly PRODUCTS_TTL = 60_000;
  private readonly STOCK_TTL    = 30_000;

  private async fetchPharmacistProducts(): Promise<any[]> {
    const db       = this.firebaseService.getDb();
    const snapshot = await db.collection('pharmacistProducts').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  private async fetchStockMap(): Promise<Record<string, number>> {
    const db       = this.firebaseService.getDb();
    const snapshot = await db.collection('products').get();
    const map: Record<string, number> = {};
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      map[data.productCode || doc.id] = data.stock ?? 0;
    });
    return map;
  }

  async getProducts(category?: string) {
    let productList: any[];
    let stockMap: Record<string, number>;

    if (this.productsCache && Date.now() - this.productsCache.ts < this.PRODUCTS_TTL) {
      productList = this.productsCache.data;
    } else {
      productList = await this.fetchPharmacistProducts();
      this.productsCache = { data: productList, ts: Date.now() };
    }

    if (this.stockCache && Date.now() - this.stockCache.ts < this.STOCK_TTL) {
      stockMap = this.stockCache.data;
    } else {
      stockMap = await this.fetchStockMap();
      this.stockCache = { data: stockMap, ts: Date.now() };
    }

    let merged = productList.map(p => ({
      ...p,
      stock: stockMap[p.stockId || p.productCode] ?? 0,
    }));

    if (category && category !== 'all') {
      merged = merged.filter(p => p.category === category);
    }

    return merged;
  }

  async decrementStock(productCode: string, quantity: number) {
    const db = this.firebaseService.getDb();

    const productsSnap = await db
      .collection('products')
      .where('productCode', '==', productCode)
      .get();

    if (productsSnap.empty) {
      return { success: false, message: 'Product not found' };
    }

    const productDoc   = productsSnap.docs[0];
    const currentStock = productDoc.data().stock ?? 0;
    const newStock     = Math.max(0, currentStock - quantity);

    await productDoc.ref.update({ stock: newStock });

    const adminSnap = await db
      .collection('adminProducts')
      .where('productId', '==', productDoc.id)
      .get();

    if (!adminSnap.empty) {
      const adminStock = adminSnap.docs[0].data().stock ?? 0;
      await adminSnap.docs[0].ref.update({
        stock: Math.max(0, adminStock - quantity),
      });
    }

    // invalidate stock cache
    this.stockCache = null;

    return { success: true, productCode, before: currentStock, after: newStock };
  }
}
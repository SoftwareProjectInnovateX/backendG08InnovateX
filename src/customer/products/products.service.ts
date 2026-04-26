import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../shared/firebase/firebase.service';

@Injectable()
export class ProductsService {
  constructor(private readonly firebaseService: FirebaseService) {}

  // Cache to improve performance
  private productsCache: { data: any[]; ts: number } | null = null;
  private stockCache: { data: Record<string, number>; ts: number } | null = null;

  //  Cache time limits
  private readonly PRODUCTS_TTL = 60_000; // 60 seconds
  private readonly STOCK_TTL = 30_000;    // 30 seconds

  //  Fetch product details from Firestore
  private async fetchPharmacistProducts(): Promise<any[]> {
    const db = this.firebaseService.getDb();
    const snapshot = await db.collection('pharmacistProducts').get();

    // Convert documents to array
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  //  Fetch stock values and map them
  private async fetchStockMap(): Promise<Record<string, number>> {
    const db = this.firebaseService.getDb();
    const snapshot = await db.collection('products').get();

    const map: Record<string, number> = {};

    snapshot.docs.forEach(doc => {
      const data = doc.data();

      // Map productCode → stock
      map[data.productCode || doc.id] = data.stock ?? 0;
    });

    return map;
  }

  //  GET PRODUCTS (main function)
  async getProducts(category?: string) {
    let productList: any[];
    let stockMap: Record<string, number>;

    //  Get products (with cache)
    if (this.productsCache && Date.now() - this.productsCache.ts < this.PRODUCTS_TTL) {
      productList = this.productsCache.data;
    } else {
      try {
        productList = await this.fetchPharmacistProducts();
        this.productsCache = { data: productList, ts: Date.now() };
      } catch (e) {
        throw new Error('Failed to fetch products from database');
      }
    }

    // Get stock (with cache)
    if (this.stockCache && Date.now() - this.stockCache.ts < this.STOCK_TTL) {
      stockMap = this.stockCache.data;
    } else {
      try {
        stockMap = await this.fetchStockMap();
        this.stockCache = { data: stockMap, ts: Date.now() };
      } catch (e) {
        throw new Error('Failed to fetch stock data from database');
      }
    }

    // Merge product details + stock
    let merged = productList.map(p => ({
      ...p,
      stock: stockMap[p.stockId || p.productCode] ?? 0,
    }));

    //  Filter by category (if provided)
    if (category && category !== 'all') {
      merged = merged.filter(p => p.category === category);
    }

    return merged;
  }

  // DECREMENT STOCK (when user buys)
  async decrementStock(productCode: string, quantity: number) {

    //Validate quantity
    if (!quantity || quantity <= 0 || !Number.isInteger(quantity)) {
      return { success: false, message: 'Invalid quantity' };
    }

    const db = this.firebaseService.getDb();

    // Find product in Firestore
    const productsSnap = await db
      .collection('products')
      .where('productCode', '==', productCode)
      .get();

    if (productsSnap.empty) {
      return { success: false, message: 'Product not found' };
    }

    let before = 0;
    let after = 0;

    // Use transaction to prevent race condition
    await db.runTransaction(async (transaction) => {
      const docRef = productsSnap.docs[0].ref;

      const docSnap = await transaction.get(docRef);

      before = docSnap.data()?.stock ?? 0;

      //  Prevent negative stock
      after = Math.max(0, before - quantity);

      transaction.update(docRef, { stock: after });
    });

    // Update adminProducts (secondary copy)
    const adminSnap = await db
      .collection('adminProducts')
      .where('productId', '==', productsSnap.docs[0].id)
      .get();

    if (!adminSnap.empty) {
      const adminStock = adminSnap.docs[0].data().stock ?? 0;

      await adminSnap.docs[0].ref.update({
        stock: Math.max(0, adminStock - quantity),
      });
    }

    //  Clear stock cache (important)
    this.stockCache = null;

    return { success: true, productCode, before, after };
  }
}
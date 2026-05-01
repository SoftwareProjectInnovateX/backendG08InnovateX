import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../shared/firebase/firebase.service';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface OrderType {
  id?: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface CustomerOrder {
  id: string;
  createdAt: FirebaseFirestore.Timestamp;
  orderStatus: string;
  paymentStatus: string;
  total: number;
  totalAmount: number;
  items?: OrderType[];
  types?: OrderType[];
}

interface ProductDoc {
  id: string;
  productName: string;
  productCode: string;
  stock: number;
  minStock: number;
  category: string;
  availability: string;
  wholesalePrice: number;
  supplierId: string;
  supplierName: string;
  expireDate?: FirebaseFirestore.Timestamp | null;
}

export interface ForecastResult {
  productId: string;
  productName: string;
  productCode: string;
  category: string;
  stock: number;
  minStock: number;
  supplierName: string;
  totalSold: number;
  dailyAvg: number;
  forecast7d: number;
  forecast30d: number;
  risk: 'High' | 'Medium' | 'Low';
  daysUntilStockout: number | null;
  dailySales: number[];
  isExpired: boolean;
}

const COMPLETED_STATUSES = [
  'Paid',
  'paid',
  'PAID',
  'delivered',
  'completed',
];

@Injectable()
export class ForecastService {
  private genAI = new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY ?? '',
  );

  constructor(private readonly firebaseService: FirebaseService) {}

  async getForecast(): Promise<ForecastResult[]> {
    const [orders, products] = await Promise.all([
      this.fetchCompletedOrders(),
      this.fetchProducts(),
    ]);

    const salesMap = this.aggregateSalesByProductId(orders);

    const now = new Date();

    const results = products.map((product) => {
      const sales = salesMap.get(product.id) ?? {
        totalSold: 0,
        dailySales: new Array(7).fill(0),
      };

      const { forecast7d, forecast30d, dailyAvg } =
        this.predictDemand(sales.dailySales);

      const risk = this.calculateStockRisk(
        product.stock,
        forecast7d,
        product.minStock,
      );

      const daysUntilStockout =
        dailyAvg > 0 ? Math.floor(product.stock / dailyAvg) : null;

      const isExpired = product.expireDate
        ? product.expireDate.toDate() < now
        : false;

      return {
        productId: product.id,
        productName: product.productName,
        productCode: product.productCode,
        category: product.category,
        stock: product.stock,
        minStock: product.minStock,
        supplierName: product.supplierName,
        totalSold: sales.totalSold,
        dailyAvg: Math.round(dailyAvg),
        forecast7d,
        forecast30d,
        risk,
        daysUntilStockout,
        dailySales: sales.dailySales,
        isExpired,
      };
    });

    return results;
  }

  async saveForecastSnapshot(): Promise<void> {
    const db = this.firebaseService.getDb();
    const results = await this.getForecast();
    const batch = db.batch();

    const today = new Date().toISOString().split('T')[0];

    for (const item of results) {
      const ref = db
        .collection('salesForecasts')
        .doc(`${today}_${item.productId}`);

      batch.set(ref, {
        ...item,
        generatedAt: new Date(),
      });
    }

    await batch.commit();
  }

  private async fetchCompletedOrders(): Promise<CustomerOrder[]> {
    const db = this.firebaseService.getDb();

    const since = new Date();
    since.setDate(since.getDate() - 30);

    const snapshot = await db
      .collection('CustomerOrders')
      .where('createdAt', '>=', since)
      .get();

    return snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as CustomerOrder))
      .filter(
        (order) =>
          COMPLETED_STATUSES.includes(order.orderStatus ?? '') ||
          COMPLETED_STATUSES.includes(order.paymentStatus ?? ''),
      );
  }

  private async fetchProducts(): Promise<ProductDoc[]> {
    const db = this.firebaseService.getDb();

    const snapshot = await db.collection('adminProducts').get();

    return snapshot.docs.map((doc) => {
      const d = doc.data();

      return {
        id: doc.id,
        productName: d.productName ?? '',
        productCode: d.productCode ?? '',
        stock: d.stock ?? 0,
        minStock: d.minStock ?? 0,
        category: d.category ?? '',
        availability: d.availability ?? '',
        wholesalePrice: d.wholesalePrice ?? 0,
        supplierId: d.supplierId ?? '',
        supplierName: d.supplierName ?? '',
        expireDate: d.expireDate ?? null,
      };
    });
  }

  private aggregateSalesByProductId(
    orders: CustomerOrder[],
  ): Map<string, { totalSold: number; dailySales: number[] }> {
    const map = new Map<
      string,
      { totalSold: number; dailySales: number[] }
    >();

    const now = Date.now();
    const MS_PER_DAY = 86400000;

    for (const order of orders) {
      const orderDate = order.createdAt?.toDate?.() ?? new Date();
      const daysAgo = Math.floor((now - orderDate.getTime()) / MS_PER_DAY);
      const slotIndex = 6 - daysAgo;

      const items = order.items ?? order.types ?? [];

      for (const item of items) {
        if (!item.id) continue;

        const productId = item.id;
        const qty = item.quantity ?? 1;

        if (!map.has(productId)) {
          map.set(productId, {
            totalSold: 0,
            dailySales: new Array(7).fill(0),
          });
        }

        const entry = map.get(productId)!;

        entry.totalSold += qty;

        if (slotIndex >= 0 && slotIndex <= 6) {
          entry.dailySales[slotIndex] += qty;
        }
      }
    }

    return map;
  }

  private predictDemand(dailySales: number[]) {
    const total = dailySales.reduce((sum, n) => sum + n, 0);
    const dailyAvg = total / 7;

    return {
      dailyAvg,
      forecast7d: Math.ceil(dailyAvg * 7),
      forecast30d: Math.ceil(dailyAvg * 30),
    };
  }

  private calculateStockRisk(
    stock: number,
    forecast7d: number,
    minStock: number,
  ): 'High' | 'Medium' | 'Low' {
    if (stock <= 0) return 'High';
    if (stock < minStock) return 'High';
    if (stock < forecast7d) return 'Medium';
    return 'Low';
  }

  async getAiInsight(productId: string): Promise<{ insight: string }> {
    const results = await this.getForecast();
    const product = results.find((p) => p.productId === productId);

    if (!product) {
      return { insight: 'Product not found.' };
    }

    const model = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
    });

    const prompt = `
Analyse this pharmacy product stock.

Product: ${product.productName}
Current stock: ${product.stock}
Forecast 7 days: ${product.forecast7d}
Risk: ${product.risk}

Give stock recommendation in 2 short sentences.
`;

    const result = await model.generateContent(prompt);

    return {
      insight: result.response.text(),
    };
  }
}
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ForecastService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForecastService = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../../shared/firebase/firebase.service");
const openai_1 = require("openai");
const COMPLETED_STATUSES = ['Paid', 'paid', 'PAID', 'delivered', 'completed'];
let ForecastService = ForecastService_1 = class ForecastService {
    firebaseService;
    logger = new common_1.Logger(ForecastService_1.name);
    constructor(firebaseService) {
        this.firebaseService = firebaseService;
    }
    async getForecast() {
        const [orders, products] = await Promise.all([
            this.fetchCompletedOrders(),
            this.fetchProducts(),
        ]);
        const salesMap = this.aggregateSalesByProductId(orders);
        const now = new Date();
        return products.map((product) => {
            const sales = salesMap.get(product.id) ?? {
                totalSold: 0,
                dailySales: new Array(7).fill(0),
            };
            const { forecast7d, forecast30d, dailyAvg } = this.predictDemand(sales.dailySales);
            const risk = this.calculateStockRisk(product.stock, forecast7d, product.minStock);
            const daysUntilStockout = dailyAvg > 0 ? Math.floor(product.stock / dailyAvg) : null;
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
    }
    async saveForecastSnapshot() {
        const db = this.firebaseService.getDb();
        const results = await this.getForecast();
        const batch = db.batch();
        const today = new Date().toISOString().split('T')[0];
        for (const item of results) {
            const ref = db.collection('salesForecasts').doc(`${today}_${item.productId}`);
            batch.set(ref, { ...item, generatedAt: new Date() });
        }
        await batch.commit();
    }
    async fetchCompletedOrders() {
        const db = this.firebaseService.getDb();
        const since = new Date();
        since.setDate(since.getDate() - 30);
        const snapshot = await db
            .collection('CustomerOrders')
            .where('createdAt', '>=', since)
            .get();
        return snapshot.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .filter((order) => COMPLETED_STATUSES.includes(order.orderStatus ?? '') ||
            COMPLETED_STATUSES.includes(order.paymentStatus ?? ''));
    }
    async fetchProducts() {
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
    aggregateSalesByProductId(orders) {
        const map = new Map();
        const now = Date.now();
        const MS_PER_DAY = 86400000;
        for (const order of orders) {
            const orderDate = order.createdAt?.toDate?.() ?? new Date();
            const daysAgo = Math.floor((now - orderDate.getTime()) / MS_PER_DAY);
            const slotIndex = 6 - daysAgo;
            const items = order.items ?? order.types ?? [];
            for (const item of items) {
                if (!item.id)
                    continue;
                const qty = item.quantity ?? 1;
                if (!map.has(item.id)) {
                    map.set(item.id, { totalSold: 0, dailySales: new Array(7).fill(0) });
                }
                const entry = map.get(item.id);
                entry.totalSold += qty;
                if (slotIndex >= 0 && slotIndex <= 6) {
                    entry.dailySales[slotIndex] += qty;
                }
            }
        }
        return map;
    }
    predictDemand(dailySales) {
        const total = dailySales.reduce((sum, n) => sum + n, 0);
        const dailyAvg = total / 7;
        return {
            dailyAvg,
            forecast7d: Math.ceil(dailyAvg * 7),
            forecast30d: Math.ceil(dailyAvg * 30),
        };
    }
    calculateStockRisk(stock, forecast7d, minStock) {
        if (stock <= 0)
            return 'High';
        if (stock < minStock)
            return 'High';
        if (stock < forecast7d)
            return 'Medium';
        return 'Low';
    }
    generateFallbackInsight(product) {
        if (product.isExpired) {
            return 'This product has expired. Remove it from inventory and avoid further sales.';
        }
        if (product.risk === 'High') {
            return 'High stock risk detected. Reorder immediately to prevent shortages.';
        }
        if (product.risk === 'Medium') {
            return 'Stock levels are becoming low. Consider replenishing inventory soon.';
        }
        return 'Stock levels are healthy and sufficient for forecasted demand.';
    }
    async getAiInsight(productId) {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            this.logger.error('GROQ_API_KEY is not set in environment variables');
            return { insight: 'AI insight unavailable: missing API key.' };
        }
        let product;
        try {
            const results = await this.getForecast();
            product = results.find((p) => p.productId === productId);
        }
        catch (err) {
            this.logger.error('getForecast() failed inside getAiInsight', err);
            throw err;
        }
        if (!product) {
            return { insight: 'Product not found.' };
        }
        const prompt = `
You are a pharmacy inventory analyst.
Product: ${product.productName}
Current Stock: ${product.stock}
Minimum Stock: ${product.minStock}
Daily Average Sales: ${product.dailyAvg}
Forecast Next 7 Days: ${product.forecast7d}
Forecast Next 30 Days: ${product.forecast30d}
Days Until Stockout: ${product.daysUntilStockout ?? 'Unknown'}
Risk Level: ${product.risk}
Expired: ${product.isExpired}
Provide:
1. A short inventory assessment.
2. A clear recommendation.
Maximum 2 sentences.
`;
        try {
            const client = new openai_1.OpenAI({
                apiKey,
                baseURL: 'https://api.groq.com/openai/v1',
            });
            const completion = await client.chat.completions.create({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.3,
                max_tokens: 100,
            });
            return {
                insight: completion.choices[0]?.message?.content?.trim() ??
                    this.generateFallbackInsight(product),
            };
        }
        catch (err) {
            this.logger.error('Groq API call failed', err?.message ?? err);
            return {
                insight: this.generateFallbackInsight(product),
            };
        }
    }
};
exports.ForecastService = ForecastService;
exports.ForecastService = ForecastService = ForecastService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService])
], ForecastService);
//# sourceMappingURL=forecast.service.js.map
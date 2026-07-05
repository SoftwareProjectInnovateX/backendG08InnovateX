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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartService = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../../shared/firebase/firebase.service");
const products_service_1 = require("../products/products.service");
let CartService = class CartService {
    firebaseService;
    productsService;
    constructor(firebaseService, productsService) {
        this.firebaseService = firebaseService;
        this.productsService = productsService;
    }
    async getCart(customerId) {
        const db = this.firebaseService.getDb();
        const snapshot = await db
            .collection('cart')
            .where('customerId', '==', customerId)
            .get();
        const merged = new Map();
        for (const doc of snapshot.docs) {
            const data = doc.data();
            const productId = data.productId || data.stockId || doc.id;
            const existing = merged.get(productId);
            if (!existing) {
                merged.set(productId, { id: doc.id, ...data });
            }
            else {
                existing.qty = Number(existing.qty || 0) + Number(data.qty || 0);
                if (!existing.category && data.category) {
                    existing.category = data.category;
                }
            }
        }
        return Array.from(merged.values());
    }
    async addItem(body) {
        const db = this.firebaseService.getDb();
        const productId = body.productId?.toString()?.trim() || '';
        if (!productId || !body.customerId) {
            return { success: false, message: 'Missing productId or customerId' };
        }
        const existingSnap = await db
            .collection('cart')
            .where('customerId', '==', body.customerId)
            .where('productId', '==', productId)
            .get();
        if (!existingSnap.empty) {
            const docs = existingSnap.docs;
            const keptDoc = docs[0];
            const existingQty = docs.reduce((sum, doc) => sum + Number(doc.data()?.qty || 0), 0);
            const newQty = existingQty + Number(body.qty || 1);
            if (docs.length > 1) {
                const batch = db.batch();
                docs.slice(1).forEach((doc) => batch.delete(doc.ref));
                await batch.commit();
            }
            const existingData = keptDoc.data();
            if ((!existingData.category || existingData.category === '') && body.category) {
                await keptDoc.ref.update({ category: body.category });
            }
            await this.updateQty(keptDoc.id, newQty);
            return { success: true, id: keptDoc.id, productId, qty: newQty };
        }
        const docRef = await db.collection('cart').add({
            customerId: body.customerId,
            productId: productId,
            stockId: body.stockId || productId,
            name: body.name,
            price: Number(body.price) || 0,
            imageUrl: body.imageUrl || '',
            category: body.category || '',
            qty: Number(body.qty) || 1,
        });
        return { success: true, id: docRef.id, ...body };
    }
    async updateQty(id, qty) {
        const db = this.firebaseService.getDb();
        const ref = db.collection('cart').doc(id);
        const snap = await ref.get();
        if (!snap.exists) {
            return { success: false, message: 'Cart item not found' };
        }
        const item = snap.data();
        const currentQty = Number(item?.qty) || 0;
        const nextQty = Number(qty) || 0;
        const delta = nextQty - currentQty;
        const stockKey = item?.stockId || item?.productId || '';
        if (delta > 0) {
            await this.productsService.decrementStock(stockKey, delta);
        }
        else if (delta < 0) {
            await this.productsService.incrementStock(stockKey, Math.abs(delta));
        }
        if (nextQty <= 0) {
            await ref.delete();
            return { success: true, id };
        }
        await ref.update({ qty: nextQty });
        const updated = await ref.get();
        return { id: updated.id, ...updated.data() };
    }
    async removeItem(id) {
        const db = this.firebaseService.getDb();
        const ref = db.collection('cart').doc(id);
        const snap = await ref.get();
        if (!snap.exists) {
            return { success: false, message: 'Cart item not found' };
        }
        const item = snap.data();
        const stockKey = item?.stockId || item?.productId || '';
        await this.productsService.incrementStock(stockKey, Number(item?.qty) || 1);
        await ref.delete();
        return { success: true, id };
    }
    async clearCart(customerId) {
        const db = this.firebaseService.getDb();
        const snapshot = await db
            .collection('cart')
            .where('customerId', '==', customerId)
            .get();
        if (snapshot.empty)
            return { success: true };
        for (const doc of snapshot.docs) {
            const item = doc.data();
            const stockKey = item.stockId || item.productId || '';
            await this.productsService.incrementStock(stockKey, Number(item.qty) || 1);
        }
        const batch = db.batch();
        snapshot.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
        return { success: true };
    }
};
exports.CartService = CartService;
exports.CartService = CartService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService,
        products_service_1.ProductsService])
], CartService);
//# sourceMappingURL=cart.service.js.map
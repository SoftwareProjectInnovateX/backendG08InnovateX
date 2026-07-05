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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../../shared/firebase/firebase.service");
const firestore_1 = require("firebase-admin/firestore");
const VALID_VISIBILITY = ['customer', 'pharmacist_only'];
let ProductsService = class ProductsService {
    firebaseService;
    constructor(firebaseService) {
        this.firebaseService = firebaseService;
    }
    async getProducts(category) {
        return this.getCustomerProducts();
    }
    async findProductDoc(productCode) {
        const db = this.firebaseService.getDb();
        if (!productCode?.trim())
            return null;
        const codeSnap = await db
            .collection('products')
            .where('productCode', '==', productCode)
            .get();
        if (!codeSnap.empty)
            return codeSnap.docs[0];
        const directDoc = await db.collection('products').doc(productCode).get();
        if (directDoc.exists)
            return directDoc;
        const pharmDoc = await db.collection('pharmacistProducts').doc(productCode).get();
        if (pharmDoc.exists) {
            const stockId = pharmDoc.data()?.stockId;
            if (stockId) {
                const stockSnap = await db
                    .collection('products')
                    .where('productCode', '==', stockId)
                    .get();
                if (!stockSnap.empty)
                    return stockSnap.docs[0];
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
                if (!stockSnap.empty)
                    return stockSnap.docs[0];
            }
        }
        return null;
    }
    async getProductCategory(productCode) {
        const productDoc = await this.findProductDoc(productCode);
        if (!productDoc || !productDoc.exists)
            return '';
        return String(productDoc.data()?.category || '');
    }
    async updateAdminProductStock(productDocId, quantity) {
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
    async decrementStock(productCode, quantity) {
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
    async incrementStock(productCode, quantity) {
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
    async getPendingProducts() {
        const db = this.firebaseService.getDb();
        const snapshot = await db
            .collection('products')
            .get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    async getAllPharmacistProducts() {
        const db = this.firebaseService.getDb();
        const snapshot = await db
            .collection('pharmacistProducts')
            .get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    async getCustomerProducts() {
        const db = this.firebaseService.getDb();
        try {
            const snapshot = await db
                .collection('pharmacistProducts')
                .where('visibility', '==', 'customer')
                .get();
            const productList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            console.log('pharmacistProducts fetched:', productList.length);
            const stockSnapshot = await db.collection('products').get();
            const stockMap = {};
            stockSnapshot.docs.forEach(doc => {
                const data = doc.data();
                stockMap[data.productCode || doc.id] = data.stock ?? 0;
            });
            console.log('stockMap keys:', Object.keys(stockMap));
            return productList.map(p => {
                const stockId = p.stockId;
                const productCode = p.productCode;
                console.log('Matching:', stockId, productCode, '→ stock:', stockMap[stockId], stockMap[productCode]);
                return {
                    ...p,
                    stock: stockMap[stockId] ?? stockMap[productCode] ?? 0,
                };
            });
        }
        catch (err) {
            console.error('getCustomerProducts ERROR:', err);
            throw err;
        }
    }
    async approvePending(id) {
        const db = this.firebaseService.getDb();
        await db.collection('products').doc(id).update({
            status: 'pharmacist_approved',
        });
        return { success: true, id };
    }
    async addProduct(body) {
        const db = this.firebaseService.getDb();
        const visibility = VALID_VISIBILITY.includes(body.visibility)
            ? body.visibility
            : 'customer';
        const docRef = await db.collection('pharmacistProducts').add({
            name: body.name,
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
            createdAt: firestore_1.FieldValue.serverTimestamp(),
        });
        return { success: true, id: docRef.id, visibility };
    }
    async updateVisibility(id, visibility) {
        if (!VALID_VISIBILITY.includes(visibility)) {
            throw new common_1.BadRequestException(`Invalid visibility. Must be one of: ${VALID_VISIBILITY.join(', ')}`);
        }
        const db = this.firebaseService.getDb();
        await db
            .collection('pharmacistProducts')
            .doc(id)
            .update({ visibility });
        return { success: true, id, visibility };
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService])
], ProductsService);
//# sourceMappingURL=products.service.js.map
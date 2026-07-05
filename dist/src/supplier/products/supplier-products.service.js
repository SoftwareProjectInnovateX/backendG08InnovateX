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
exports.SupplierProductsService = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../../shared/firebase/firebase.service");
const firestore_1 = require("firebase-admin/firestore");
let SupplierProductsService = class SupplierProductsService {
    firebaseService;
    constructor(firebaseService) {
        this.firebaseService = firebaseService;
    }
    async getProducts(supplierId) {
        const db = this.firebaseService.getDb();
        const snapshot = await db
            .collection('products')
            .where('supplierId', '==', supplierId)
            .orderBy('createdAt', 'desc')
            .get();
        return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
    async getPendingProducts(supplierId) {
        const db = this.firebaseService.getDb();
        const snapshot = await db.collection('products')
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
                approvedAt: data.approvedAt ? { _seconds: data.approvedAt.seconds } : null,
                rejectedAt: data.rejectedAt ? { _seconds: data.rejectedAt.seconds } : null,
            };
        });
    }
    async createProduct(supplierId, supplierName, dto) {
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
            createdAt: firestore_1.Timestamp.now(),
            updatedAt: firestore_1.Timestamp.now(),
        };
        const docRef = await db.collection('pendingProducts').add(pendingProduct);
        return { success: true, pendingProductId: docRef.id };
    }
    async updateProduct(productId, dto) {
        const db = this.firebaseService.getDb();
        const productRef = db.collection('products').doc(productId);
        const productSnap = await productRef.get();
        if (!productSnap.exists) {
            throw new common_1.NotFoundException('Product not found');
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
            updatedAt: firestore_1.Timestamp.now(),
        };
        await productRef.update(updatedData);
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
    async deleteProduct(productId) {
        const db = this.firebaseService.getDb();
        await db.collection('products').doc(productId).delete();
        const adminSnap = await db
            .collection('adminProducts')
            .where('productId', '==', productId)
            .get();
        if (!adminSnap.empty) {
            await db.collection('adminProducts').doc(adminSnap.docs[0].id).delete();
        }
        return { success: true };
    }
};
exports.SupplierProductsService = SupplierProductsService;
exports.SupplierProductsService = SupplierProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService])
], SupplierProductsService);
//# sourceMappingURL=supplier-products.service.js.map
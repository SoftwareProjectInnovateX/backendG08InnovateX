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
exports.AdminProductApprovalService = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_js_1 = require("../../shared/firebase/firebase.service.js");
const counters_service_js_1 = require("../../shared/counters/counters.service.js");
const firestore_1 = require("firebase-admin/firestore");
const mail_service_js_1 = require("../../shared/mail/mail.service.js");
let AdminProductApprovalService = class AdminProductApprovalService {
    firebaseService;
    countersService;
    mailService;
    constructor(firebaseService, countersService, mailService) {
        this.firebaseService = firebaseService;
        this.countersService = countersService;
        this.mailService = mailService;
    }
    async getAllPending() {
        const db = this.firebaseService.getDb();
        const snapshot = await db
            .collection('pendingProducts')
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
    async approveProduct(pendingProductId) {
        const db = this.firebaseService.getDb();
        const pendingRef = db.collection('pendingProducts').doc(pendingProductId);
        const pendingSnap = await pendingRef.get();
        if (!pendingSnap.exists) {
            throw new common_1.NotFoundException('Pending product not found');
        }
        const data = pendingSnap.data();
        const productCode = await this.countersService.generateProductCode();
        const suppliedStock = data.stock ?? 0;
        const remainingStock = data.minStock ?? 0;
        const productPayload = {
            productName: data.productName,
            productCode,
            category: data.category,
            wholesalePrice: data.wholesalePrice,
            stock: suppliedStock,
            minStock: remainingStock,
            description: data.description || '',
            manufacturer: data.manufacturer || '',
            availability: suppliedStock > 0 ? 'in stock' : 'out of stock',
            supplierId: data.supplierId,
            supplierName: data.supplierName,
            createdAt: firestore_1.Timestamp.now(),
            updatedAt: firestore_1.Timestamp.now(),
        };
        const productRef = await db.collection('products').add(productPayload);
        await db.collection('adminProducts').add({
            productId: productRef.id,
            supplierId: data.supplierId,
            supplierName: data.supplierName,
            productName: data.productName,
            productCode,
            category: data.category,
            wholesalePrice: data.wholesalePrice,
            retailPrice: (data.wholesalePrice ?? 0) * 1.2,
            stock: suppliedStock,
            minStock: remainingStock,
            description: data.description || '',
            manufacturer: data.manufacturer || '',
            availability: suppliedStock > 0 ? 'in stock' : 'out of stock',
            lastRestocked: firestore_1.Timestamp.now(),
            createdAt: firestore_1.Timestamp.now(),
            updatedAt: firestore_1.Timestamp.now(),
        });
        await pendingRef.update({
            status: 'approved',
            approvedAt: firestore_1.Timestamp.now(),
            productCode,
            productId: productRef.id,
        });
        await db.collection('notifications').add({
            type: 'PRODUCT_APPROVED',
            recipientId: data.supplierId,
            recipientType: 'supplier',
            supplierId: data.supplierId,
            pendingProductId,
            productName: data.productName,
            productCode,
            message: `Your product "${data.productName}" (${productCode}) has been approved and added to the inventory.`,
            read: false,
            createdAt: firestore_1.Timestamp.now(),
        });
        if (data.supplierEmail) {
            await this.mailService.sendProductApprovedEmail({
                to: data.supplierEmail,
                supplierName: data.supplierName,
                productName: data.productName,
                productCode,
            });
        }
        else {
            console.warn(`[ApproveProduct] No supplierEmail found for supplierId: ${data.supplierId}. Email not sent.`);
        }
        return { success: true, productId: productRef.id, productCode };
    }
    async rejectProduct(pendingProductId, reason) {
        const db = this.firebaseService.getDb();
        const pendingRef = db.collection('pendingProducts').doc(pendingProductId);
        const pendingSnap = await pendingRef.get();
        if (!pendingSnap.exists) {
            throw new common_1.NotFoundException('Pending product not found');
        }
        const data = pendingSnap.data();
        await pendingRef.update({
            status: 'rejected',
            rejectedAt: firestore_1.Timestamp.now(),
            rejectionReason: reason || '',
        });
        await db.collection('notifications').add({
            type: 'PRODUCT_REJECTED',
            recipientId: data.supplierId,
            recipientType: 'supplier',
            supplierId: data.supplierId,
            pendingProductId,
            productName: data.productName,
            rejectionReason: reason || '',
            message: `Your product "${data.productName}" was not approved.${reason ? ' Reason: ' + reason : ''}`,
            read: false,
            createdAt: firestore_1.Timestamp.now(),
        });
        if (data.supplierEmail) {
            await this.mailService.sendProductRejectedEmail({
                to: data.supplierEmail,
                supplierName: data.supplierName,
                productName: data.productName,
                reason,
            });
        }
        else {
            console.warn(`[RejectProduct] No supplierEmail found for supplierId: ${data.supplierId}. Email not sent.`);
        }
        return { success: true };
    }
};
exports.AdminProductApprovalService = AdminProductApprovalService;
exports.AdminProductApprovalService = AdminProductApprovalService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_js_1.FirebaseService,
        counters_service_js_1.CountersService,
        mail_service_js_1.MailService])
], AdminProductApprovalService);
//# sourceMappingURL=admin-product-approval.service.js.map
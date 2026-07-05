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
exports.PurchaseOrdersService = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../../shared/firebase/firebase.service");
const firestore_1 = require("firebase/firestore");
let PurchaseOrdersService = class PurchaseOrdersService {
    firebaseService;
    db;
    constructor(firebaseService) {
        this.firebaseService = firebaseService;
        this.firebaseService.getDb();
    }
    async getOrders(supplierId, status) {
        try {
            const ordersRef = (0, firestore_1.collection)(this.db, 'purchaseOrders');
            const q = !status || status === 'All Orders'
                ? (0, firestore_1.query)(ordersRef, (0, firestore_1.where)('supplierId', '==', supplierId), (0, firestore_1.orderBy)('createdAt', 'desc'))
                : (0, firestore_1.query)(ordersRef, (0, firestore_1.where)('supplierId', '==', supplierId), (0, firestore_1.where)('status', '==', status), (0, firestore_1.orderBy)('createdAt', 'desc'));
            const snapshot = await (0, firestore_1.getDocs)(q);
            return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        }
        catch (error) {
            throw new common_1.BadRequestException('Error loading orders: ' + error.message);
        }
    }
    async getOrderById(orderId) {
        const orderRef = (0, firestore_1.doc)(this.db, 'purchaseOrders', orderId);
        const orderSnap = await (0, firestore_1.getDoc)(orderRef);
        if (!orderSnap.exists()) {
            throw new common_1.NotFoundException('Order not found');
        }
        return { id: orderSnap.id, ...orderSnap.data() };
    }
    async approveOrder(orderId, supplierId, supplierName) {
        const orderRef = (0, firestore_1.doc)(this.db, 'purchaseOrders', orderId);
        const orderSnap = await (0, firestore_1.getDoc)(orderRef);
        if (!orderSnap.exists())
            throw new common_1.NotFoundException('Order not found');
        const order = orderSnap.data();
        if (order.supplierId !== supplierId) {
            throw new common_1.BadRequestException('Unauthorized: order does not belong to this supplier');
        }
        if (order.status !== 'PENDING') {
            throw new common_1.BadRequestException('Order is not in PENDING status');
        }
        const productRef = (0, firestore_1.doc)(this.db, 'products', order.productId);
        const productSnap = await (0, firestore_1.getDoc)(productRef);
        if (!productSnap.exists()) {
            throw new common_1.NotFoundException('Product not found in supplier inventory');
        }
        const currentSupplierMinStock = productSnap.data().minStock ?? 0;
        if (currentSupplierMinStock < order.quantity) {
            throw new common_1.BadRequestException(`Insufficient remaining stock! Required: ${order.quantity}, Available: ${currentSupplierMinStock}`);
        }
        await (0, firestore_1.updateDoc)(orderRef, {
            status: 'APPROVED',
            approvedAt: firestore_1.Timestamp.now(),
            approvalDate: firestore_1.Timestamp.now(),
            updatedAt: firestore_1.Timestamp.now(),
        });
        await (0, firestore_1.updateDoc)(productRef, {
            minStock: currentSupplierMinStock - order.quantity,
            updatedAt: firestore_1.Timestamp.now(),
        });
        if (order.adminProductId) {
            const adminProductRef = (0, firestore_1.doc)(this.db, 'adminProducts', order.adminProductId);
            const adminProductSnap = await (0, firestore_1.getDoc)(adminProductRef);
            if (adminProductSnap.exists()) {
                const currentAdminStock = adminProductSnap.data().stock ?? 0;
                await (0, firestore_1.updateDoc)(adminProductRef, {
                    stock: currentAdminStock + order.quantity,
                    minStock: currentSupplierMinStock - order.quantity,
                    availability: 'in stock',
                    lastRestocked: firestore_1.Timestamp.now(),
                    updatedAt: firestore_1.Timestamp.now(),
                });
            }
        }
        const totalAmount = Number(order.amount ?? order.totalAmount);
        const initialPaymentDueDate = firestore_1.Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
        await (0, firestore_1.addDoc)((0, firestore_1.collection)(this.db, 'payments'), {
            orderId: order.poId,
            purchaseOrderId: orderId,
            supplierName,
            supplierId,
            productName: order.product ?? order.productName,
            quantity: order.quantity,
            amount: totalAmount * 0.5,
            totalOrderAmount: totalAmount,
            paymentType: 'INITIAL',
            paymentLabel: 'Initial Payment (50%)',
            status: 'PENDING',
            adminProductId: order.adminProductId,
            dueDate: initialPaymentDueDate,
            createdAt: firestore_1.Timestamp.now(),
            updatedAt: firestore_1.Timestamp.now(),
        });
        await (0, firestore_1.addDoc)((0, firestore_1.collection)(this.db, 'invoices'), {
            purchaseOrderId: orderId,
            orderId: order.poId,
            invoiceNumber: `INV-${order.poId}-INITIAL`,
            pharmacy: 'MediCareX',
            supplierId,
            supplierName,
            productName: order.product ?? order.productName,
            adminProductId: order.adminProductId,
            quantity: order.quantity,
            invoiceType: 'INITIAL',
            invoiceLabel: 'Initial Payment (50%)',
            items: [
                {
                    productName: order.product ?? order.productName,
                    quantity: order.quantity,
                    unitPrice: Number(order.unitPrice ?? 0),
                },
            ],
            subtotal: totalAmount * 0.5,
            taxRate: 0,
            taxAmount: 0,
            totalAmount: totalAmount * 0.5,
            totalOrderAmount: totalAmount,
            paymentStatus: 'Pending',
            invoiceDate: new Date().toISOString().split('T')[0],
            dueDate: initialPaymentDueDate.toDate().toISOString().split('T')[0],
            createdAt: firestore_1.Timestamp.now(),
            updatedAt: firestore_1.Timestamp.now(),
        });
        await (0, firestore_1.addDoc)((0, firestore_1.collection)(this.db, 'notifications'), {
            type: 'ORDER_APPROVED',
            recipientId: 'admin',
            recipientType: 'admin',
            orderId,
            poId: order.poId,
            supplierId,
            supplierName,
            productName: order.product ?? order.productName,
            quantity: order.quantity,
            totalAmount: order.amount ?? order.totalAmount,
            adminProductId: order.adminProductId,
            message: `Order Approved: ${supplierName} approved order ${order.poId} for ${order.quantity} units of ${order.product ?? order.productName}`,
            read: false,
            createdAt: firestore_1.Timestamp.now(),
        });
        return {
            success: true,
            message: 'Order approved successfully',
            orderId,
        };
    }
    async rejectOrder(orderId, supplierId, supplierName, rejectReason) {
        if (!rejectReason?.trim()) {
            throw new common_1.BadRequestException('Rejection reason is required');
        }
        const orderRef = (0, firestore_1.doc)(this.db, 'purchaseOrders', orderId);
        const orderSnap = await (0, firestore_1.getDoc)(orderRef);
        if (!orderSnap.exists())
            throw new common_1.NotFoundException('Order not found');
        const order = orderSnap.data();
        if (order.supplierId !== supplierId) {
            throw new common_1.BadRequestException('Unauthorized: order does not belong to this supplier');
        }
        if (order.status !== 'PENDING') {
            throw new common_1.BadRequestException('Order is not in PENDING status');
        }
        await (0, firestore_1.updateDoc)(orderRef, {
            status: 'REJECTED',
            rejectedAt: firestore_1.Timestamp.now(),
            rejectionReason: rejectReason,
            rejectionDate: firestore_1.Timestamp.now(),
            updatedAt: firestore_1.Timestamp.now(),
        });
        await (0, firestore_1.addDoc)((0, firestore_1.collection)(this.db, 'notifications'), {
            type: 'ORDER_REJECTED',
            recipientId: 'admin',
            recipientType: 'admin',
            orderId,
            poId: order.poId,
            supplierId,
            supplierName,
            productName: order.product ?? order.productName,
            quantity: order.quantity,
            totalAmount: order.amount ?? order.totalAmount,
            rejectionReason: rejectReason,
            message: `Order Rejected: ${supplierName} rejected order ${order.poId} - Reason: ${rejectReason}`,
            read: false,
            createdAt: firestore_1.Timestamp.now(),
        });
        return {
            success: true,
            message: 'Order rejected successfully',
            orderId,
        };
    }
};
exports.PurchaseOrdersService = PurchaseOrdersService;
exports.PurchaseOrdersService = PurchaseOrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService])
], PurchaseOrdersService);
//# sourceMappingURL=purchase-orders.service.js.map
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../../shared/firebase/firebase.service");
const products_service_1 = require("../products/products.service");
const loyalty_service_1 = require("../loyalty/loyalty.service");
const firestore_1 = require("firebase-admin/firestore");
const mail_service_1 = require("../../shared/mail/mail.service");
const crypto = __importStar(require("crypto"));
let OrdersService = class OrdersService {
    firebaseService;
    productsService;
    loyaltyService;
    mailService;
    constructor(firebaseService, productsService, loyaltyService, mailService) {
        this.firebaseService = firebaseService;
        this.productsService = productsService;
        this.loyaltyService = loyaltyService;
        this.mailService = mailService;
    }
    async generateHash(orderId, amount, currency) {
        const merchantId = process.env.PAYHERE_MERCHANT_ID;
        const secret = process.env.PAYHERE_SECRET;
        if (!merchantId || !secret) {
            throw new Error("PayHere environment variables missing");
        }
        const db = this.firebaseService.getDb();
        const snap = await db.collection('CustomerOrders').where('orderId', '==', orderId).get();
        if (snap.empty) {
            throw new Error("Order not found");
        }
        const orderData = snap.docs[0].data();
        const actualAmount = Number(orderData.totalAmount).toFixed(2);
        const hashedSecret = crypto.createHash('md5').update(secret).digest('hex').toUpperCase();
        const hashString = merchantId + orderId + actualAmount + currency + hashedSecret;
        const hash = crypto.createHash('md5').update(hashString).digest('hex').toUpperCase();
        return { hash, merchantId, actualAmount };
    }
    async normalizeOrderItems(items) {
        return Promise.all((items || []).map(async (item) => {
            const category = item.category ||
                (item.productId ? await this.productsService.getProductCategory(item.productId) : '') ||
                (item.stockId ? await this.productsService.getProductCategory(item.stockId) : '');
            return {
                ...item,
                category,
            };
        }));
    }
    async createOrder(body, user) {
        try {
            const db = this.firebaseService.getDb();
            const rawItems = body.items || [];
            const normalizedItems = await this.normalizeOrderItems(rawItems);
            const orderPayload = {
                orderId: body.orderId,
                userId: user?.uid || body.userId || null,
                customerName: `${body.firstName} ${body.lastName}`,
                email: body.email || user?.email || null,
                phone: body.phone,
                address: `${body.houseNumber}, ${body.laneStreet}, ${body.city}`,
                country: body.country || 'Sri Lanka',
                orderNotes: body.orderNotes || '',
                paymentMethod: body.paymentMethod,
                paymentStatus: body.paymentMethod === 'ONLINE' ? 'paid' : 'pending',
                orderStatus: body.orderStatus || 'pending',
                totalAmount: body.totalAmount,
                categories: [...new Set(normalizedItems.map((item) => item.category || '').filter(Boolean))],
                types: normalizedItems,
                createdAt: firestore_1.FieldValue.serverTimestamp(),
            };
            const docRef = await db.collection('CustomerOrders').add(orderPayload);
            const poId = `PO-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 7);
            const firstItem = normalizedItems[0] || rawItems[0] || {};
            await db.collection('payments').add({
                amount: body.totalAmount,
                createdAt: firestore_1.FieldValue.serverTimestamp(),
                dueDate: dueDate,
                orderId: poId,
                paymentLabel: body.paymentMethod === 'ONLINE'
                    ? 'Full Payment (Online)'
                    : 'Cash on Delivery',
                paymentType: body.paymentMethod === 'ONLINE' ? 'ONLINE' : 'COD',
                productName: firstItem?.name || '',
                purchaseOrderId: '',
                quantity: rawItems.reduce((sum, i) => sum + (i.quantity || 1), 0),
                status: body.paymentMethod === 'ONLINE' ? 'PAID' : 'PENDING',
                supplierId: null,
                supplierName: null,
                totalOrderAmount: body.totalAmount,
                customerOrderId: docRef.id,
                customerId: user?.uid || body.userId || null,
            });
            const poRef = await db.collection('purchaseOrders').add({
                deliveredAt: null,
                initialPaymentDate: firestore_1.FieldValue.serverTimestamp(),
                initialPaymentStatus: body.paymentMethod === 'ONLINE' ? 'PAID' : 'PENDING',
                orderDate: firestore_1.FieldValue.serverTimestamp(),
                pharmacistAcknowledged: false,
                pharmacy: body.pharmacy || '',
                poId: poId,
                product: firstItem?.name || '',
                productId: firstItem?.id || '',
                quantity: rawItems.reduce((sum, i) => sum + (i.quantity || 1), 0),
                reorderLevel: 0,
                status: 'PENDING',
                customerOrderId: docRef.id,
            });
            const paymentsSnap = await db
                .collection('payments')
                .where('customerOrderId', '==', docRef.id)
                .limit(1)
                .get();
            if (!paymentsSnap.empty) {
                await paymentsSnap.docs[0].ref.update({ purchaseOrderId: poRef.id });
            }
            if (user?.uid) {
                await this.loyaltyService.addPurchase(user.uid, body.totalAmount, docRef.id);
            }
            return { success: true, id: docRef.id };
        }
        catch (error) {
            console.error('❌ createOrder FAILED:', error);
            throw new common_1.HttpException({ message: 'Failed to create order', detail: error?.message || error }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getOrders(userId, email) {
        try {
            const db = this.firebaseService.getDb();
            let ref = db
                .collection('CustomerOrders')
                .orderBy('createdAt', 'desc');
            if (userId) {
                ref = ref.where('userId', '==', userId);
            }
            else if (email) {
                ref = ref.where('email', '==', email);
            }
            else {
                return [];
            }
            const snapshot = await ref.get();
            return snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt
                        ? { _seconds: data.createdAt.seconds, seconds: data.createdAt.seconds }
                        : null,
                };
            });
        }
        catch (error) {
            console.error('❌ getOrders FAILED:', error);
            throw new common_1.HttpException('Failed to fetch orders', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getDeliveredOrders() {
        try {
            const db = this.firebaseService.getDb();
            const snapshot = await db
                .collection('CustomerOrders')
                .where('orderStatus', '==', 'delivered')
                .get();
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
        }
        catch (error) {
            console.error('❌ getDeliveredOrders FAILED:', error);
            throw new common_1.HttpException('Failed to fetch delivered orders', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getProductCodeByName(name) {
        try {
            const db = this.firebaseService.getDb();
            const snapshot = await db
                .collection('products')
                .where('productName', '==', name)
                .get();
            if (snapshot.empty)
                return { productCode: null };
            return { productCode: snapshot.docs[0].data().productCode ?? null };
        }
        catch (error) {
            console.error('❌ getProductCodeByName FAILED:', error);
            throw new common_1.HttpException('Failed to fetch product code', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getOrderDetails(orderId) {
        const db = this.firebaseService.getDb();
        const snap = await db.collection('CustomerOrders').where('orderId', '==', orderId).get();
        if (snap.empty)
            return null;
        return { id: snap.docs[0].id, ...snap.docs[0].data() };
    }
    async handleNotify(body) {
        const merchantId = process.env.PAYHERE_MERCHANT_ID;
        const secret = process.env.PAYHERE_SECRET;
        if (!merchantId || !secret) {
            console.error("PayHere environment variables missing");
            return { received: false };
        }
        const orderId = body.order_id;
        const payhereAmount = body.payhere_amount;
        const payhereCurrency = body.payhere_currency;
        const statusCode = body.status_code;
        const md5sig = body.md5sig;
        const hashedSecret = crypto.createHash('md5').update(secret).digest('hex').toUpperCase();
        const hashString = merchantId + orderId + payhereAmount + payhereCurrency + statusCode + hashedSecret;
        const generatedSig = crypto.createHash('md5').update(hashString).digest('hex').toUpperCase();
        if (generatedSig === md5sig) {
            const db = this.firebaseService.getDb();
            const snap = await db.collection('CustomerOrders').where('orderId', '==', orderId).get();
            if (!snap.empty) {
                const docId = snap.docs[0].id;
                const orderData = snap.docs[0].data();
                let newStatus = 'pending';
                if (parseFloat(payhereAmount) !== parseFloat(orderData.totalAmount)) {
                    newStatus = 'failed';
                    console.error(`Security Warning: Amount mismatch for order ${orderId}. Expected ${orderData.totalAmount}, got ${payhereAmount}`);
                }
                else if (statusCode == 2) {
                    newStatus = 'paid';
                }
                else if (statusCode < 0) {
                    newStatus = 'failed';
                }
                await db.collection('CustomerOrders').doc(docId).update({
                    paymentStatus: newStatus,
                    orderStatus: newStatus === 'paid' ? 'Paid' : newStatus === 'failed' ? 'Failed' : 'Pending',
                });
                console.log(`Order ${orderId} updated to ${newStatus} via PayHere Webhook`);
                if (newStatus === 'paid' && orderData.paymentStatus !== 'paid' && orderData.email) {
                    this.mailService.sendInvoiceEmail({
                        to: orderData.email,
                        customerName: orderData.customerName,
                        orderId: orderData.orderId,
                        address: orderData.address,
                        phone: orderData.phone,
                        totalAmount: orderData.totalAmount,
                        items: orderData.types
                    }).catch(err => console.error("Error sending invoice email (webhook):", err));
                }
                if (newStatus === 'paid' && orderData.rxId) {
                    const rxId = orderData.rxId;
                    const rxRef = db.collection('prescriptions').doc(rxId);
                    const rxSnap = await rxRef.get();
                    if (rxSnap.exists) {
                        const rxData = rxSnap.data();
                        const orderItemsForSuccess = rxData?.orderItems || rxData?.medications || [];
                        const dispensedRef = db.collection('pharmacistDispensed').where('rxId', '==', rxId);
                        const dispensedSnap = await dispensedRef.get();
                        const dispensePayload = {
                            rxId: rxId,
                            patientName: orderData.customerName,
                            verifiedPatient: orderData.customerName,
                            phone: orderData.phone,
                            address: orderData.address,
                            orderItems: orderItemsForSuccess,
                            total: orderData.totalAmount,
                            paymentStatus: 'Paid',
                            paymentMethod: 'ONLINE',
                            createdAt: new Date().toISOString(),
                            finalized: false
                        };
                        if (!dispensedSnap.empty) {
                            await db.collection('pharmacistDispensed').doc(dispensedSnap.docs[0].id).update(dispensePayload);
                        }
                        else {
                            await db.collection('pharmacistDispensed').add(dispensePayload);
                        }
                        await rxRef.update({
                            status: 'Paid',
                            customerConfirmed: true,
                            paymentMethod: 'ONLINE',
                            confirmedAt: firestore_1.FieldValue.serverTimestamp(),
                            customerAddress: orderData.address
                        });
                    }
                }
            }
        }
        else {
            console.error("Invalid PayHere MD5 signature");
        }
        return { received: true };
    }
    async confirmPaymentLocally(orderId) {
        const db = this.firebaseService.getDb();
        const snap = await db.collection('CustomerOrders').where('orderId', '==', orderId).get();
        if (!snap.empty) {
            const orderData = snap.docs[0].data();
            await db.collection('CustomerOrders').doc(snap.docs[0].id).update({
                paymentStatus: 'paid',
                orderStatus: 'Paid'
            });
            if (orderData.paymentStatus !== 'paid' && orderData.email) {
                this.mailService.sendInvoiceEmail({
                    to: orderData.email,
                    customerName: orderData.customerName,
                    orderId: orderData.orderId,
                    address: orderData.address,
                    phone: orderData.phone,
                    totalAmount: orderData.totalAmount,
                    items: orderData.types
                }).catch(err => console.error("Error sending invoice email (local):", err));
            }
            return { success: true };
        }
        return { success: false };
    }
    async settlePayment(customerOrderId) {
        try {
            const db = this.firebaseService.getDb();
            await db.collection('CustomerOrders').doc(customerOrderId).update({
                paymentStatus: 'paid',
                paymentSettledAt: firestore_1.FieldValue.serverTimestamp(),
            });
            const paymentsSnap = await db
                .collection('payments')
                .where('customerOrderId', '==', customerOrderId)
                .get();
            const paymentUpdates = paymentsSnap.docs.map(doc => doc.ref.update({ status: 'PAID' }));
            await Promise.all(paymentUpdates);
            const poSnap = await db
                .collection('purchaseOrders')
                .where('customerOrderId', '==', customerOrderId)
                .get();
            const poUpdates = poSnap.docs.map(doc => doc.ref.update({
                status: 'COMPLETED',
                deliveredAt: firestore_1.FieldValue.serverTimestamp(),
            }));
            await Promise.all(poUpdates);
            return { success: true };
        }
        catch (error) {
            console.error('❌ settlePayment FAILED:', error);
            throw new common_1.HttpException('Failed to settle payment', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService,
        products_service_1.ProductsService,
        loyalty_service_1.LoyaltyService,
        mail_service_1.MailService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map
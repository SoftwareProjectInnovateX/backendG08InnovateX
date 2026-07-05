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
exports.PharmacistOrdersService = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_js_1 = require("../../shared/firebase/firebase.service.js");
const firestore_1 = require("firebase-admin/firestore");
let PharmacistOrdersService = class PharmacistOrdersService {
    firebaseService;
    collectionName = 'CustomerOrders';
    returnsCollection = 'CustomerReturns';
    constructor(firebaseService) {
        this.firebaseService = firebaseService;
    }
    async getOnlineOrders() {
        const db = this.firebaseService.getDb();
        const snapshot = await db
            .collection(this.collectionName)
            .orderBy('createdAt', 'desc')
            .get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    async addOnlineOrder(orderData) {
        const db = this.firebaseService.getDb();
        const docRef = await db.collection(this.collectionName).add(orderData);
        return { id: docRef.id, ...orderData };
    }
    async updateOnlineOrder(id, updateData) {
        const db = this.firebaseService.getDb();
        await db.collection(this.collectionName).doc(id).update(updateData);
        return { id, ...updateData };
    }
    async getReturns() {
        const db = this.firebaseService.getDb();
        const snapshot = await db
            .collection(this.returnsCollection)
            .orderBy('createdAt', 'desc')
            .get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    async updateReturnStatus(id, updateData) {
        const db = this.firebaseService.getDb();
        const returnSnap = await db.collection(this.returnsCollection).doc(id).get();
        const returnData = returnSnap.data();
        const items = returnData?.items || [];
        console.log('Return items:', items);
        console.log('Update data:', updateData);
        await db.collection(this.returnsCollection).doc(id).update(updateData);
        if (updateData.returnStatus === 'approved') {
            for (const item of items) {
                const productCode = item.id;
                const quantity = item.quantity || 1;
                if (!productCode)
                    continue;
                const productSnap = await db
                    .collection('products')
                    .where('productCode', '==', productCode)
                    .limit(1)
                    .get();
                if (!productSnap.empty) {
                    const productDoc = productSnap.docs[0];
                    await productDoc.ref.update({
                        stock: firestore_1.FieldValue.increment(quantity),
                    });
                    console.log(`Stock restored: ${productCode} +${quantity}`);
                }
                else {
                    console.warn(`Product not found for code: ${productCode}`);
                }
            }
        }
        return { id, ...updateData };
    }
};
exports.PharmacistOrdersService = PharmacistOrdersService;
exports.PharmacistOrdersService = PharmacistOrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_js_1.FirebaseService])
], PharmacistOrdersService);
//# sourceMappingURL=pharmacist-orders.service.js.map
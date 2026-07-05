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
exports.PharmacistReturnsService = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_js_1 = require("../../shared/firebase/firebase.service.js");
const firestore_1 = require("firebase-admin/firestore");
let PharmacistReturnsService = class PharmacistReturnsService {
    firebaseService;
    collectionName = 'CustomerReturns';
    productsCollection = 'products';
    constructor(firebaseService) {
        this.firebaseService = firebaseService;
    }
    async getReturnRequests() {
        const db = this.firebaseService.getDb();
        const snapshot = await db.collection(this.collectionName).get();
        const data = snapshot.docs.map(doc => ({ firebaseId: doc.id, id: doc.id, ...doc.data() }));
        data.sort((a, b) => (b.createdAt?._seconds ?? 0) - (a.createdAt?._seconds ?? 0));
        return data;
    }
    async addReturnRequest(returnData) {
        const db = this.firebaseService.getDb();
        const docRef = await db.collection(this.collectionName).add(returnData);
        return { id: docRef.id, ...returnData };
    }
    async updateReturnRequest(id, updateData) {
        const db = this.firebaseService.getDb();
        const docRef = db.collection(this.collectionName).doc(id);
        await docRef.update(updateData);
        return { id, ...updateData };
    }
    async approveReturn(id, adjNote, items) {
        const db = this.firebaseService.getDb();
        await db.collection(this.collectionName).doc(id).update({
            returnStatus: 'approved',
            refundStatus: 'processed',
            adjustmentNote: adjNote,
            processedAt: firestore_1.FieldValue.serverTimestamp(),
        });
        const restockResults = [];
        await Promise.all(items.map(async (item) => {
            const code = item.productCode;
            if (!code) {
                restockResults.push({ name: item.name, status: 'skipped', reason: 'missing productCode' });
                return;
            }
            const qty = Math.abs(parseInt(item.quantity, 10) || 1);
            const snap = await db
                .collection(this.productsCollection)
                .where('productCode', '==', code)
                .get();
            if (!snap.empty) {
                const productRef = snap.docs[0].ref;
                const beforeStock = snap.docs[0].data().stock ?? 0;
                await productRef.update({
                    stock: firestore_1.FieldValue.increment(qty),
                });
                restockResults.push({
                    name: item.name,
                    code,
                    status: 'restocked',
                    before: beforeStock,
                    after: beforeStock + qty,
                });
            }
            else {
                restockResults.push({ name: item.name, code, status: 'product_not_found' });
            }
        }));
        return { id, returnStatus: 'approved', refundStatus: 'processed', restockResults };
    }
    async rejectReturn(id, adjNote) {
        const db = this.firebaseService.getDb();
        await db.collection(this.collectionName).doc(id).update({
            returnStatus: 'rejected',
            refundStatus: 'rejected',
            adjustmentNote: adjNote,
            processedAt: firestore_1.FieldValue.serverTimestamp(),
        });
        return { id, returnStatus: 'rejected', refundStatus: 'rejected' };
    }
};
exports.PharmacistReturnsService = PharmacistReturnsService;
exports.PharmacistReturnsService = PharmacistReturnsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_js_1.FirebaseService])
], PharmacistReturnsService);
//# sourceMappingURL=pharmacist-returns.service.js.map
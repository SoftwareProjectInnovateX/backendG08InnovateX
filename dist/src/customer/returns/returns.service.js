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
exports.ReturnsService = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../../shared/firebase/firebase.service");
const firestore_1 = require("firebase-admin/firestore");
let ReturnsService = class ReturnsService {
    firebaseService;
    constructor(firebaseService) {
        this.firebaseService = firebaseService;
    }
    async getReturns() {
        const db = this.firebaseService.getDb();
        const snapshot = await db
            .collection('CustomerReturns')
            .orderBy('createdAt', 'desc')
            .get();
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
    }
    async submitReturn(body) {
        const db = this.firebaseService.getDb();
        const docRef = await db.collection('CustomerReturns').add({
            orderId: body.orderId || null,
            customerName: body.customerName || null,
            phone: body.phone || null,
            address: body.address || null,
            items: body.items || [],
            refundAmount: body.refundAmount || 0,
            adjustmentNote: body.adjustmentNote || null,
            returnStatus: 'pending',
            refundStatus: 'pending',
            createdAt: firestore_1.FieldValue.serverTimestamp(),
            processedAt: null,
        });
        return { success: true, id: docRef.id };
    }
};
exports.ReturnsService = ReturnsService;
exports.ReturnsService = ReturnsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService])
], ReturnsService);
//# sourceMappingURL=returns.service.js.map
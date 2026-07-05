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
exports.ProfileService = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../../shared/firebase/firebase.service");
const firestore_1 = require("firebase-admin/firestore");
let ProfileService = class ProfileService {
    firebaseService;
    constructor(firebaseService) {
        this.firebaseService = firebaseService;
    }
    calculateLevel(points) {
        if (points >= 5000)
            return 'Platinum';
        if (points >= 2000)
            return 'Gold';
        return 'Silver';
    }
    async getLoyaltyFromOrders(uid, db) {
        const ordersSnap = await db
            .collection('CustomerOrders')
            .where('userId', '==', uid)
            .get();
        if (ordersSnap.empty) {
            return { loyaltyPoints: 0, totalPoints: 0, level: 'Silver', recommendedOffers: [] };
        }
        const totalPoints = ordersSnap.docs.reduce((sum, doc) => {
            return sum + Math.floor(doc.data().totalAmount || 0);
        }, 0);
        return {
            loyaltyPoints: totalPoints,
            totalPoints,
            level: this.calculateLevel(totalPoints),
            recommendedOffers: [],
        };
    }
    async getProfile(uid) {
        const db = this.firebaseService.getDb();
        const [snap, loyaltySnap] = await Promise.all([
            db.collection('users').doc(uid).get(),
            db.collection('loyaltyCustomers').doc(uid).get(),
        ]);
        const loyaltyData = await this.getLoyaltyFromOrders(uid, db);
        if (loyaltySnap.exists) {
            const l = loyaltySnap.data();
            loyaltyData.recommendedOffers = l?.recommendedOffers ?? [];
        }
        if (snap.exists) {
            return {
                id: snap.id,
                ...snap.data(),
                ...loyaltyData,
            };
        }
        const ordersSnap = await db
            .collection('CustomerOrders')
            .where('userId', '==', uid)
            .limit(1)
            .get();
        if (!ordersSnap.empty) {
            const order = ordersSnap.docs[0].data();
            await db.collection('users').doc(uid).set({
                fullName: order.customerName || '',
                email: order.email || '',
                phone: order.phone || '',
                role: 'customer',
                status: 'active',
                createdAt: firestore_1.FieldValue.serverTimestamp(),
            });
            return {
                id: uid,
                fullName: order.customerName || '',
                email: order.email || '',
                phone: order.phone || '',
                role: 'customer',
                status: 'active',
                ...loyaltyData,
            };
        }
        throw new common_1.NotFoundException('User not found');
    }
    async updateProfile(uid, body) {
        const db = this.firebaseService.getDb();
        const docRef = db.collection('users').doc(uid);
        const updatePayload = {
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
        };
        if (body.fullName !== undefined)
            updatePayload.fullName = body.fullName;
        if (body.phone !== undefined)
            updatePayload.phone = body.phone;
        if (body.address !== undefined)
            updatePayload.address = body.address;
        if (body.photoURL !== undefined)
            updatePayload.photoURL = body.photoURL;
        await docRef.update(updatePayload);
        return { success: true, uid };
    }
};
exports.ProfileService = ProfileService;
exports.ProfileService = ProfileService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService])
], ProfileService);
//# sourceMappingURL=profile.service.js.map
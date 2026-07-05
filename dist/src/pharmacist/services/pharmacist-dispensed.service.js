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
exports.PharmacistDispensedService = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_js_1 = require("../../shared/firebase/firebase.service.js");
const loyalty_service_js_1 = require("../../customer/loyalty/loyalty.service.js");
let PharmacistDispensedService = class PharmacistDispensedService {
    firebaseService;
    loyaltyService;
    collectionName = 'pharmacistDispensed';
    constructor(firebaseService, loyaltyService) {
        this.firebaseService = firebaseService;
        this.loyaltyService = loyaltyService;
    }
    async getDispensedHistory() {
        const db = this.firebaseService.getDb();
        const snapshot = await db.collection(this.collectionName).get();
        return snapshot.docs.map(doc => ({ firebaseId: doc.id, id: doc.id, ...doc.data() }));
    }
    async addDispensedRecord(dispenseData) {
        const db = this.firebaseService.getDb();
        if (!dispenseData.createdAt)
            dispenseData.createdAt = new Date().toISOString();
        const docRef = await db.collection(this.collectionName).add(dispenseData);
        return { id: docRef.id, ...dispenseData };
    }
    async updateDispensedRecord(id, updateData) {
        const db = this.firebaseService.getDb();
        const docRef = db.collection(this.collectionName).doc(id);
        await docRef.update(updateData);
        if (updateData.paymentStatus === 'paid') {
            try {
                const dispensedDoc = await docRef.get();
                const dispensedData = dispensedDoc.data();
                const rxId = dispensedData?.rxId;
                if (rxId) {
                    const paymentSnap = await db.collection('payments')
                        .where('purchaseOrderId', '==', rxId)
                        .get();
                    if (!paymentSnap.empty) {
                        const batch = db.batch();
                        paymentSnap.docs.forEach(doc => {
                            batch.update(doc.ref, { status: 'PAID' });
                        });
                        await batch.commit();
                        console.log(`Updated ${paymentSnap.size} payment(s) for rxId: ${rxId}`);
                    }
                    else {
                        console.warn(`No payments found for rxId: ${rxId}`);
                    }
                }
                else {
                    console.warn('No rxId found in dispensed document:', id);
                }
                try {
                    const patientEmail = dispensedData?.patientEmail || updateData?.patientEmail;
                    const amount = Number(dispensedData?.total || updateData?.total || 0);
                    if (patientEmail && amount > 0) {
                        const userSnap = await db.collection('users').where('email', '==', patientEmail).limit(1).get();
                        if (!userSnap.empty) {
                            const userDoc = userSnap.docs[0];
                            const uid = userDoc.id;
                            const orderId = dispensedData?.rxId || id;
                            await this.loyaltyService.addPurchase(uid, amount, orderId);
                            console.log(`Credited loyalty for uid=${uid} from dispensed id=${id}`);
                        }
                        else {
                            console.warn('Could not find user for patientEmail when crediting loyalty:', patientEmail);
                        }
                    }
                }
                catch (err) {
                    console.warn('Failed to credit loyalty on dispensed payment:', err?.message || err);
                }
            }
            catch (err) {
                console.warn('Could not sync payment status to payments collection:', err.message);
            }
        }
        return { id, ...updateData };
    }
};
exports.PharmacistDispensedService = PharmacistDispensedService;
exports.PharmacistDispensedService = PharmacistDispensedService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_js_1.FirebaseService,
        loyalty_service_js_1.LoyaltyService])
], PharmacistDispensedService);
//# sourceMappingURL=pharmacist-dispensed.service.js.map
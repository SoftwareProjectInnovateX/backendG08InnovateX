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
exports.AccountRequestsService = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_js_1 = require("../../shared/firebase/firebase.service.js");
const mail_service_js_1 = require("../../shared/mail/mail.service.js");
const firestore_1 = require("firebase-admin/firestore");
function generateTempPassword() {
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lower = 'abcdefghjkmnpqrstuvwxyz';
    const digits = '23456789';
    const special = '!@#$%';
    const all = upper + lower + digits + special;
    let pass = upper[Math.floor(Math.random() * upper.length)] +
        lower[Math.floor(Math.random() * lower.length)] +
        digits[Math.floor(Math.random() * digits.length)] +
        special[Math.floor(Math.random() * special.length)];
    for (let i = 4; i < 10; i++) {
        pass += all[Math.floor(Math.random() * all.length)];
    }
    return pass
        .split('')
        .sort(() => Math.random() - 0.5)
        .join('');
}
let AccountRequestsService = class AccountRequestsService {
    firebaseService;
    mailService;
    constructor(firebaseService, mailService) {
        this.firebaseService = firebaseService;
        this.mailService = mailService;
    }
    async getRequests() {
        const db = this.firebaseService.getDb();
        const snap = await db
            .collection('pendingRequests')
            .orderBy('requestedAt', 'desc')
            .get();
        return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
    async approveRequest(requestId) {
        const db = this.firebaseService.getDb();
        const auth = this.firebaseService.getAdmin();
        const reqRef = db.collection('pendingRequests').doc(requestId);
        const reqSnap = await reqRef.get();
        if (!reqSnap.exists)
            throw new common_1.NotFoundException('Request not found');
        const request = reqSnap.data();
        if (request.status !== 'pending') {
            throw new common_1.BadRequestException('Request has already been processed');
        }
        const tempPassword = generateTempPassword();
        let userRecord;
        try {
            userRecord = await auth.createUser({
                email: request.email,
                password: tempPassword,
                displayName: request.companyName || request.fullName,
            });
        }
        catch (authError) {
            if (authError.code === 'auth/email-already-exists') {
                throw new common_1.BadRequestException(`An account with email ${request.email} already exists.`);
            }
            throw authError;
        }
        const uid = userRecord.uid;
        if (request.type === 'supplier') {
            const supplierId = await this.generateNextId('suppliers', 'S');
            await db
                .collection('suppliers')
                .doc(uid)
                .set({
                supplierId,
                userId: uid,
                name: request.companyName,
                email: request.email,
                phone: request.phone,
                contactPerson: request.contactPerson,
                businessRegNo: request.businessRegNo,
                businessAddress: request.businessAddress,
                categories: request.categories || [],
                bankName: request.bankName,
                accountNumber: request.accountNumber,
                accountHolderName: request.accountHolderName,
                rating: 0,
                status: 'active',
                role: 'supplier',
                createdAt: firestore_1.FieldValue.serverTimestamp(),
                updatedAt: firestore_1.FieldValue.serverTimestamp(),
            });
        }
        else {
            const pharmacistId = await this.generateNextId('pharmacists', 'P');
            await db.collection('pharmacists').doc(uid).set({
                pharmacistId,
                userId: uid,
                name: request.fullName,
                email: request.email,
                phone: request.phone,
                nicNumber: request.nicNumber,
                licenseNumber: request.licenseNumber,
                licenseExpiry: request.licenseExpiry,
                specialization: request.specialization,
                role: 'pharmacist',
                status: 'active',
                createdAt: firestore_1.FieldValue.serverTimestamp(),
                updatedAt: firestore_1.FieldValue.serverTimestamp(),
            });
        }
        await reqRef.update({
            status: 'approved',
            approvedAt: firestore_1.FieldValue.serverTimestamp(),
        });
        await this.mailService.sendApprovalEmail({
            to: request.email,
            name: request.companyName ?? request.fullName ?? '',
            role: request.type,
            tempPassword,
        });
        return {
            success: true,
            message: `Account approved. Email sent to ${request.email}.`,
            tempPassword,
        };
    }
    async rejectRequest(requestId) {
        const db = this.firebaseService.getDb();
        const reqRef = db.collection('pendingRequests').doc(requestId);
        const reqSnap = await reqRef.get();
        if (!reqSnap.exists)
            throw new common_1.NotFoundException('Request not found');
        const request = reqSnap.data();
        if (request.status !== 'pending') {
            throw new common_1.BadRequestException('Request has already been processed');
        }
        await reqRef.update({
            status: 'rejected',
            rejectedAt: firestore_1.FieldValue.serverTimestamp(),
        });
        await this.mailService.sendRejectionEmail({
            to: request.email,
            name: request.companyName ?? request.fullName ?? '',
            role: request.type,
        });
        return {
            success: true,
            message: `Request rejected. Email sent to ${request.email}.`,
        };
    }
    async generateNextId(collectionName, prefix) {
        const db = this.firebaseService.getDb();
        const snapshot = await db.collection(collectionName).get();
        const idField = `${collectionName.slice(0, -1)}Id`;
        let maxNum = 0;
        snapshot.forEach((d) => {
            const val = d.data()[idField];
            if (val) {
                const num = parseInt(String(val).replace(prefix, ''), 10);
                if (num > maxNum)
                    maxNum = num;
            }
        });
        return `${prefix}${String(maxNum + 1).padStart(3, '0')}`;
    }
};
exports.AccountRequestsService = AccountRequestsService;
exports.AccountRequestsService = AccountRequestsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_js_1.FirebaseService,
        mail_service_js_1.MailService])
], AccountRequestsService);
//# sourceMappingURL=account-requests.service.js.map
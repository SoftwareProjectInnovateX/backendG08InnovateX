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
exports.ContactService = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../../shared/firebase/firebase.service");
const firestore_1 = require("firebase-admin/firestore");
let ContactService = class ContactService {
    firebaseService;
    constructor(firebaseService) {
        this.firebaseService = firebaseService;
    }
    async sendMessage(body) {
        const db = this.firebaseService.getDb();
        const docRef = await db.collection('contactMessages').add({
            name: body.name || null,
            email: body.email || null,
            message: body.message || null,
            reply: '',
            status: 'unread',
            createdAt: firestore_1.FieldValue.serverTimestamp(),
        });
        return { success: true, id: docRef.id };
    }
    async getMessagesByEmail(email) {
        const db = this.firebaseService.getDb();
        const snapshot = await db
            .collection('contactMessages')
            .where('email', '==', email)
            .orderBy('createdAt', 'desc')
            .get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    async getAllMessages() {
        const db = this.firebaseService.getDb();
        const snapshot = await db
            .collection('contactMessages')
            .orderBy('createdAt', 'desc')
            .get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    async markAsRead(id) {
        const db = this.firebaseService.getDb();
        await db.collection('contactMessages').doc(id).update({ status: 'read' });
        return { success: true, id };
    }
    async replyMessage(id, reply) {
        const db = this.firebaseService.getDb();
        await db.collection('contactMessages').doc(id).update({
            reply,
            status: 'replied',
        });
        return { success: true, id };
    }
};
exports.ContactService = ContactService;
exports.ContactService = ContactService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService])
], ContactService);
//# sourceMappingURL=contact.service.js.map
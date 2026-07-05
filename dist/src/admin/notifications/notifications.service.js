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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../../shared/firebase/firebase.service");
const firestore_1 = require("firebase-admin/firestore");
let NotificationsService = class NotificationsService {
    firebaseService;
    constructor(firebaseService) {
        this.firebaseService = firebaseService;
    }
    get db() {
        return this.firebaseService.getDb();
    }
    async getNotifications(recipientType = 'admin') {
        const snapshot = await this.db
            .collection('notifications')
            .where('recipientType', '==', recipientType)
            .orderBy('createdAt', 'desc')
            .get();
        return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
    async markAsRead(notificationId) {
        const ref = this.db.collection('notifications').doc(notificationId);
        const snap = await ref.get();
        if (!snap.exists) {
            throw new common_1.NotFoundException('Notification not found');
        }
        await ref.update({ read: true });
        return { success: true, message: 'Notification marked as read' };
    }
    async markAllAsRead() {
        const snapshot = await this.db
            .collection('notifications')
            .where('recipientType', '==', 'admin')
            .where('read', '==', false)
            .get();
        const batch = this.db.batch();
        snapshot.docs.forEach((d) => batch.update(d.ref, { read: true }));
        await batch.commit();
        return { success: true, message: `${snapshot.size} notifications marked as read` };
    }
    async markOrderAsReceived(notificationId) {
        const notifRef = this.db.collection('notifications').doc(notificationId);
        const notifSnap = await notifRef.get();
        if (!notifSnap.exists) {
            throw new common_1.NotFoundException('Notification not found');
        }
        const notification = notifSnap.data();
        const orderRef = this.db.collection('purchaseOrders').doc(notification.orderId);
        const orderSnap = await orderRef.get();
        if (!orderSnap.exists) {
            throw new common_1.NotFoundException('Order not found');
        }
        const order = orderSnap.data();
        if (order.status !== 'APPROVED') {
            throw new common_1.BadRequestException('Order must be APPROVED before marking as received');
        }
        await orderRef.update({
            status: 'COMPLETED',
            completionDate: firestore_1.FieldValue.serverTimestamp(),
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
        });
        const adminProductRef = this.db.collection('adminProducts').doc(order.adminProductId);
        const adminProductSnap = await adminProductRef.get();
        if (adminProductSnap.exists) {
            const adminProduct = adminProductSnap.data();
            await adminProductRef.update({
                stock: (adminProduct.stock || 0) + order.quantity,
                availability: 'in stock',
                lastRestocked: firestore_1.FieldValue.serverTimestamp(),
                updatedAt: firestore_1.FieldValue.serverTimestamp(),
            });
        }
        await notifRef.update({ read: true });
        return {
            success: true,
            message: 'Order marked as received. Inventory has been updated.',
        };
    }
    async deleteNotification(notificationId) {
        const ref = this.db.collection('notifications').doc(notificationId);
        const snap = await ref.get();
        if (!snap.exists) {
            throw new common_1.NotFoundException('Notification not found');
        }
        await ref.delete();
        return { success: true, message: 'Notification deleted' };
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map
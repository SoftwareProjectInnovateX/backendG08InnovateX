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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_js_1 = require("../../shared/firebase/firebase.service.js");
const common_2 = require("@nestjs/common");
let OrdersService = class OrdersService {
    firebaseService;
    constructor(firebaseService) {
        this.firebaseService = firebaseService;
    }
    async getAllOrders() {
        const db = this.firebaseService.getDb();
        const snapshot = await db
            .collection('orders')
            .orderBy('date', 'desc')
            .get();
        return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
    async getOrderById(id) {
        const db = this.firebaseService.getDb();
        const docSnap = await db.collection('orders').doc(id).get();
        if (!docSnap.exists)
            throw new common_1.NotFoundException('Order not found');
        return { id: docSnap.id, ...docSnap.data() };
    }
    async createOrder(orderPayload) {
        try {
            const db = this.firebaseService.getDb();
            const currentTimestamp = new Date().toISOString();
            const orderData = {
                ...orderPayload,
                date: currentTimestamp,
                createdAt: currentTimestamp
            };
            const docRef = await db.collection('orders').add(orderData);
            return {
                id: docRef.id,
                ...orderData
            };
        }
        catch (error) {
            throw new common_2.InternalServerErrorException(`Order creation failed: ${error.message}`);
        }
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_js_1.FirebaseService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map
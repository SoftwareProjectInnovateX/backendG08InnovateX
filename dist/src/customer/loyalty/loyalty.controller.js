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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoyaltyController = void 0;
const common_1 = require("@nestjs/common");
const loyalty_service_1 = require("./loyalty.service");
const ai_service_1 = require("./ai.service");
const firebase_auth_guard_1 = require("../../auth/firebase-auth.guard");
let LoyaltyController = class LoyaltyController {
    loyaltyService;
    aiService;
    constructor(loyaltyService, aiService) {
        this.loyaltyService = loyaltyService;
        this.aiService = aiService;
    }
    async getAnalytics() {
        try {
            return await this.loyaltyService.getAnalytics();
        }
        catch (error) {
            const err = error;
            console.error('analytics error:', err?.message, err?.stack);
            return {
                totalCustomers: 0,
                totalRevenue: 0,
                totalPoints: 0,
                averageOrderValue: 0,
                levelDistribution: { Silver: 0, Gold: 0, Platinum: 0 },
            };
        }
    }
    async getTopCustomers() {
        try {
            return await this.loyaltyService.getTopCustomers();
        }
        catch (error) {
            const err = error;
            console.error('top-customers error:', err?.message, err?.stack);
            return [];
        }
    }
    async getCampaignIdeas() {
        try {
            const ideas = await this.aiService.generateCampaignIdeas();
            return { ideas };
        }
        catch (error) {
            const err = error;
            console.error('campaign-ideas error:', err?.message, err?.stack);
            return { ideas: [] };
        }
    }
    async getPersonalizedOffers(uid) {
        try {
            const offers = await this.loyaltyService.generatePersonalizedOffers(uid);
            return { offers };
        }
        catch (error) {
            const err = error;
            console.error('offers error:', err?.message);
            return { offers: [] };
        }
    }
    async getCustomerProfile(uid) {
        try {
            if (uid.includes('@')) {
                return await this.loyaltyService.getCustomerByEmailAndSync(uid);
            }
            return await this.loyaltyService.getCustomerProfile(uid);
        }
        catch (error) {
            const err = error;
            console.error('customer profile error:', err?.message);
            return null;
        }
    }
    async updateCustomerProfile(uid, updates) {
        try {
            await this.loyaltyService.updateCustomerProfile(uid, updates);
            return { success: true };
        }
        catch (error) {
            const err = error;
            console.error('update profile error:', err?.message);
            return { success: false, error: err?.message };
        }
    }
    async addPurchase(body) {
        try {
            await this.loyaltyService.addPurchase(body.uid, body.orderAmount, body.orderId);
            return { success: true };
        }
        catch (error) {
            const err = error;
            console.error('add purchase error:', err?.message);
            return { success: false, error: err?.message };
        }
    }
    async syncFromOrders() {
        try {
            return await this.loyaltyService.syncFromOrders();
        }
        catch (error) {
            const err = error;
            console.error('sync error:', err?.message);
            return { success: false, error: err?.message };
        }
    }
    async consolidateDuplicates() {
        try {
            return await this.loyaltyService.consolidateDuplicates();
        }
        catch (error) {
            const err = error;
            console.error('consolidate error:', err?.message);
            return { success: false, error: err?.message };
        }
    }
    async debugOrders(email) {
        const db = this.loyaltyService['firebaseService'].getDb();
        const snap = await db
            .collection('CustomerOrders')
            .where('email', '==', email)
            .get();
        return snap.docs.map((doc) => ({
            id: doc.id,
            userId: doc.data().userId,
            email: doc.data().email,
            customerName: doc.data().customerName,
            totalAmount: doc.data().totalAmount,
            createdAt: doc.data().createdAt,
        }));
    }
    async debugLoyalty(uid) {
        const db = this.loyaltyService['firebaseService'].getDb();
        const doc = await db.collection('loyaltyCustomers').doc(uid).get();
        return { id: doc.id, exists: doc.exists, data: doc.data() };
    }
};
exports.LoyaltyController = LoyaltyController;
__decorate([
    (0, common_1.Get)('analytics'),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LoyaltyController.prototype, "getAnalytics", null);
__decorate([
    (0, common_1.Get)('top-customers'),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LoyaltyController.prototype, "getTopCustomers", null);
__decorate([
    (0, common_1.Get)('campaign-ideas'),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LoyaltyController.prototype, "getCampaignIdeas", null);
__decorate([
    (0, common_1.Get)('customer/:uid/offers'),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard),
    __param(0, (0, common_1.Param)('uid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LoyaltyController.prototype, "getPersonalizedOffers", null);
__decorate([
    (0, common_1.Get)('customer/:uid'),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard),
    __param(0, (0, common_1.Param)('uid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LoyaltyController.prototype, "getCustomerProfile", null);
__decorate([
    (0, common_1.Put)('customer/:uid'),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard),
    __param(0, (0, common_1.Param)('uid')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LoyaltyController.prototype, "updateCustomerProfile", null);
__decorate([
    (0, common_1.Post)('purchase'),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LoyaltyController.prototype, "addPurchase", null);
__decorate([
    (0, common_1.Post)('sync-from-orders'),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LoyaltyController.prototype, "syncFromOrders", null);
__decorate([
    (0, common_1.Post)('consolidate-duplicates'),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LoyaltyController.prototype, "consolidateDuplicates", null);
__decorate([
    (0, common_1.Get)('debug-orders/:email'),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard),
    __param(0, (0, common_1.Param)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LoyaltyController.prototype, "debugOrders", null);
__decorate([
    (0, common_1.Get)('debug-loyalty/:uid'),
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard),
    __param(0, (0, common_1.Param)('uid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LoyaltyController.prototype, "debugLoyalty", null);
exports.LoyaltyController = LoyaltyController = __decorate([
    (0, common_1.Controller)('loyalty'),
    __metadata("design:paramtypes", [loyalty_service_1.LoyaltyService,
        ai_service_1.AIService])
], LoyaltyController);
//# sourceMappingURL=loyalty.controller.js.map
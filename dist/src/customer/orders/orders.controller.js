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
exports.OrdersController = void 0;
const common_1 = require("@nestjs/common");
const orders_service_1 = require("./orders.service");
const firebase_auth_guard_js_1 = require("../../auth/firebase-auth.guard.js");
let OrdersController = class OrdersController {
    ordersService;
    constructor(ordersService) {
        this.ordersService = ordersService;
    }
    async createOrder(req, body) {
        return this.ordersService.createOrder(body, req.user);
    }
    async generateHash(orderId, amount, currency) {
        return this.ordersService.generateHash(orderId, amount, currency);
    }
    async confirmPayment(id) {
        return this.ordersService.confirmPaymentLocally(id);
    }
    async getOrders(req) {
        return this.ordersService.getOrders(req.user.uid, req.user.email);
    }
    async getDeliveredOrders() {
        return this.ordersService.getDeliveredOrders();
    }
    async getProductCode(name) {
        return this.ordersService.getProductCodeByName(name);
    }
    async getOrderDetails(id) {
        return this.ordersService.getOrderDetails(id);
    }
    async notify(body) {
        return this.ordersService.handleNotify(body);
    }
    async settlePayment(id) {
        return this.ordersService.settlePayment(id);
    }
};
exports.OrdersController = OrdersController;
__decorate([
    (0, common_1.UseGuards)(firebase_auth_guard_js_1.FirebaseAuthGuard),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "createOrder", null);
__decorate([
    (0, common_1.Get)('generate-hash'),
    __param(0, (0, common_1.Query)('orderId')),
    __param(1, (0, common_1.Query)('amount')),
    __param(2, (0, common_1.Query)('currency')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "generateHash", null);
__decorate([
    (0, common_1.Post)(':id/confirm'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "confirmPayment", null);
__decorate([
    (0, common_1.UseGuards)(firebase_auth_guard_js_1.FirebaseAuthGuard),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getOrders", null);
__decorate([
    (0, common_1.Get)('delivered'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getDeliveredOrders", null);
__decorate([
    (0, common_1.Get)('product-code/:name'),
    __param(0, (0, common_1.Param)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getProductCode", null);
__decorate([
    (0, common_1.Get)('details/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getOrderDetails", null);
__decorate([
    (0, common_1.Post)('notify'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "notify", null);
__decorate([
    (0, common_1.Put)(':id/settle-payment'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "settlePayment", null);
exports.OrdersController = OrdersController = __decorate([
    (0, common_1.Controller)('customer-orders'),
    __metadata("design:paramtypes", [orders_service_1.OrdersService])
], OrdersController);
//# sourceMappingURL=orders.controller.js.map
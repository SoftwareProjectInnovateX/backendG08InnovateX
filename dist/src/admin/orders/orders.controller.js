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
const orders_service_js_1 = require("./orders.service.js");
const firebase_auth_guard_js_1 = require("../../auth/firebase-auth.guard.js");
const roles_guard_js_1 = require("../../auth/roles.guard.js");
const roles_decorator_js_1 = require("../../auth/roles.decorator.js");
let OrdersController = class OrdersController {
    ordersService;
    constructor(ordersService) {
        this.ordersService = ordersService;
    }
    getAll() {
        return this.ordersService.getAllOrders();
    }
    getOne(id) {
        return this.ordersService.getOrderById(id);
    }
    async create(orderData) {
        return await this.ordersService.createOrder(orderData);
    }
};
exports.OrdersController = OrdersController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "getOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "create", null);
exports.OrdersController = OrdersController = __decorate([
    (0, common_1.Controller)('orders'),
    (0, common_1.UseGuards)(firebase_auth_guard_js_1.FirebaseAuthGuard, roles_guard_js_1.RolesGuard),
    (0, roles_decorator_js_1.Roles)('admin'),
    __metadata("design:paramtypes", [orders_service_js_1.OrdersService])
], OrdersController);
//# sourceMappingURL=orders.controller.js.map
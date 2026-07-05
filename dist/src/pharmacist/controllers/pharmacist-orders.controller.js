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
exports.PharmacistOrdersController = void 0;
const common_1 = require("@nestjs/common");
const pharmacist_orders_service_js_1 = require("../services/pharmacist-orders.service.js");
let PharmacistOrdersController = class PharmacistOrdersController {
    ordersService;
    constructor(ordersService) {
        this.ordersService = ordersService;
    }
    async getReturns() {
        return this.ordersService.getReturns();
    }
    async updateReturnStatus(id, updateData) {
        return this.ordersService.updateReturnStatus(id, updateData);
    }
    async getOnlineOrders() {
        return this.ordersService.getOnlineOrders();
    }
    async addOnlineOrder(orderData) {
        return this.ordersService.addOnlineOrder(orderData);
    }
    async updateOnlineOrder(id, updateData) {
        return this.ordersService.updateOnlineOrder(id, updateData);
    }
};
exports.PharmacistOrdersController = PharmacistOrdersController;
__decorate([
    (0, common_1.Get)('returns'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PharmacistOrdersController.prototype, "getReturns", null);
__decorate([
    (0, common_1.Put)('returns/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PharmacistOrdersController.prototype, "updateReturnStatus", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PharmacistOrdersController.prototype, "getOnlineOrders", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PharmacistOrdersController.prototype, "addOnlineOrder", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PharmacistOrdersController.prototype, "updateOnlineOrder", null);
exports.PharmacistOrdersController = PharmacistOrdersController = __decorate([
    (0, common_1.Controller)('pharmacist/orders'),
    __metadata("design:paramtypes", [pharmacist_orders_service_js_1.PharmacistOrdersService])
], PharmacistOrdersController);
//# sourceMappingURL=pharmacist-orders.controller.js.map
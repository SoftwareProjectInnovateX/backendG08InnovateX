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
exports.PurchaseOrdersController = void 0;
const common_1 = require("@nestjs/common");
const purchase_orders_service_1 = require("./purchase-orders.service");
const approve_order_dto_1 = require("./dto/approve-order.dto");
const reject_order_dto_1 = require("./dto/reject-order.dto");
let PurchaseOrdersController = class PurchaseOrdersController {
    purchaseOrdersService;
    constructor(purchaseOrdersService) {
        this.purchaseOrdersService = purchaseOrdersService;
    }
    async getOrders(supplierId, status) {
        return this.purchaseOrdersService.getOrders(supplierId, status);
    }
    async getOrderById(orderId) {
        return this.purchaseOrdersService.getOrderById(orderId);
    }
    async approveOrder(orderId, body) {
        return this.purchaseOrdersService.approveOrder(orderId, body.supplierId, body.supplierName);
    }
    async rejectOrder(orderId, body) {
        return this.purchaseOrdersService.rejectOrder(orderId, body.supplierId, body.supplierName, body.rejectReason);
    }
};
exports.PurchaseOrdersController = PurchaseOrdersController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('supplierId')),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PurchaseOrdersController.prototype, "getOrders", null);
__decorate([
    (0, common_1.Get)(':orderId'),
    __param(0, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PurchaseOrdersController.prototype, "getOrderById", null);
__decorate([
    (0, common_1.Patch)(':orderId/approve'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, approve_order_dto_1.ApproveOrderDto]),
    __metadata("design:returntype", Promise)
], PurchaseOrdersController.prototype, "approveOrder", null);
__decorate([
    (0, common_1.Patch)(':orderId/reject'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, reject_order_dto_1.RejectOrderDto]),
    __metadata("design:returntype", Promise)
], PurchaseOrdersController.prototype, "rejectOrder", null);
exports.PurchaseOrdersController = PurchaseOrdersController = __decorate([
    (0, common_1.Controller)('supplier/purchase-orders'),
    __metadata("design:paramtypes", [purchase_orders_service_1.PurchaseOrdersService])
], PurchaseOrdersController);
//# sourceMappingURL=purchase-orders.controller.js.map
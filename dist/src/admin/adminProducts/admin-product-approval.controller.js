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
exports.AdminProductApprovalController = void 0;
const common_1 = require("@nestjs/common");
const admin_product_approval_service_js_1 = require("./admin-product-approval.service.js");
const firebase_auth_guard_js_1 = require("../../auth/firebase-auth.guard.js");
const roles_guard_js_1 = require("../../auth/roles.guard.js");
const roles_decorator_js_1 = require("../../auth/roles.decorator.js");
class RejectDto {
    reason;
}
let AdminProductApprovalController = class AdminProductApprovalController {
    approvalService;
    constructor(approvalService) {
        this.approvalService = approvalService;
    }
    getAllPending() {
        return this.approvalService.getAllPending();
    }
    approve(id) {
        return this.approvalService.approveProduct(id);
    }
    reject(id, body) {
        return this.approvalService.rejectProduct(id, body.reason);
    }
};
exports.AdminProductApprovalController = AdminProductApprovalController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminProductApprovalController.prototype, "getAllPending", null);
__decorate([
    (0, common_1.Patch)(':id/approve'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminProductApprovalController.prototype, "approve", null);
__decorate([
    (0, common_1.Patch)(':id/reject'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, RejectDto]),
    __metadata("design:returntype", void 0)
], AdminProductApprovalController.prototype, "reject", null);
exports.AdminProductApprovalController = AdminProductApprovalController = __decorate([
    (0, common_1.Controller)('admin/pending-products'),
    (0, common_1.UseGuards)(firebase_auth_guard_js_1.FirebaseAuthGuard, roles_guard_js_1.RolesGuard),
    (0, roles_decorator_js_1.Roles)('admin'),
    __metadata("design:paramtypes", [admin_product_approval_service_js_1.AdminProductApprovalService])
], AdminProductApprovalController);
//# sourceMappingURL=admin-product-approval.controller.js.map
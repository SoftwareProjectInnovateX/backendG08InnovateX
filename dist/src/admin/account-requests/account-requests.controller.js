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
exports.AccountRequestsController = void 0;
const common_1 = require("@nestjs/common");
const account_requests_service_js_1 = require("./account-requests.service.js");
const firebase_auth_guard_js_1 = require("../../auth/firebase-auth.guard.js");
const roles_guard_js_1 = require("../../auth/roles.guard.js");
const roles_decorator_js_1 = require("../../auth/roles.decorator.js");
let AccountRequestsController = class AccountRequestsController {
    service;
    constructor(service) {
        this.service = service;
    }
    getAll() {
        return this.service.getRequests();
    }
    approve(id) {
        return this.service.approveRequest(id);
    }
    reject(id) {
        return this.service.rejectRequest(id);
    }
};
exports.AccountRequestsController = AccountRequestsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AccountRequestsController.prototype, "getAll", null);
__decorate([
    (0, common_1.Post)(':id/approve'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AccountRequestsController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)(':id/reject'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AccountRequestsController.prototype, "reject", null);
exports.AccountRequestsController = AccountRequestsController = __decorate([
    (0, common_1.Controller)('account-requests'),
    (0, common_1.UseGuards)(firebase_auth_guard_js_1.FirebaseAuthGuard, roles_guard_js_1.RolesGuard),
    (0, roles_decorator_js_1.Roles)('admin'),
    __metadata("design:paramtypes", [account_requests_service_js_1.AccountRequestsService])
], AccountRequestsController);
//# sourceMappingURL=account-requests.controller.js.map
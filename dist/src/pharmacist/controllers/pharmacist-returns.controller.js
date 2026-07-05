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
exports.PharmacistReturnsController = void 0;
const common_1 = require("@nestjs/common");
const pharmacist_returns_service_js_1 = require("../services/pharmacist-returns.service.js");
let PharmacistReturnsController = class PharmacistReturnsController {
    returnsService;
    constructor(returnsService) {
        this.returnsService = returnsService;
    }
    async getReturnRequests() {
        return this.returnsService.getReturnRequests();
    }
    async addReturnRequest(returnData) {
        return this.returnsService.addReturnRequest(returnData);
    }
    async approveReturn(id, body) {
        return this.returnsService.approveReturn(id, body.adjNote, body.items);
    }
    async rejectReturn(id, body) {
        return this.returnsService.rejectReturn(id, body.adjNote);
    }
    async updateReturnRequest(id, updateData) {
        return this.returnsService.updateReturnRequest(id, updateData);
    }
};
exports.PharmacistReturnsController = PharmacistReturnsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PharmacistReturnsController.prototype, "getReturnRequests", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PharmacistReturnsController.prototype, "addReturnRequest", null);
__decorate([
    (0, common_1.Put)(':id/approve'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PharmacistReturnsController.prototype, "approveReturn", null);
__decorate([
    (0, common_1.Put)(':id/reject'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PharmacistReturnsController.prototype, "rejectReturn", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PharmacistReturnsController.prototype, "updateReturnRequest", null);
exports.PharmacistReturnsController = PharmacistReturnsController = __decorate([
    (0, common_1.Controller)('pharmacist/returns'),
    __metadata("design:paramtypes", [pharmacist_returns_service_js_1.PharmacistReturnsService])
], PharmacistReturnsController);
//# sourceMappingURL=pharmacist-returns.controller.js.map
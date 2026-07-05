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
exports.PharmacistDispensedController = void 0;
const common_1 = require("@nestjs/common");
const pharmacist_dispensed_service_js_1 = require("../services/pharmacist-dispensed.service.js");
const firebase_auth_guard_js_1 = require("../../auth/firebase-auth.guard.js");
let PharmacistDispensedController = class PharmacistDispensedController {
    dispensedService;
    constructor(dispensedService) {
        this.dispensedService = dispensedService;
    }
    async getDispensedHistory() {
        return this.dispensedService.getDispensedHistory();
    }
    async addDispensedRecord(req, dispenseData) {
        try {
            const userEmail = req?.user?.email;
            if (userEmail) {
                dispenseData.patientEmail = userEmail;
            }
        }
        catch (err) {
            console.warn('Could not resolve authenticated user email for dispensed record:', err?.message || err);
        }
        return this.dispensedService.addDispensedRecord(dispenseData);
    }
    async settlePayment(id) {
        return this.dispensedService.updateDispensedRecord(id, { paymentStatus: 'paid' });
    }
    async updateDispensedRecord(id, updateData) {
        return this.dispensedService.updateDispensedRecord(id, updateData);
    }
};
exports.PharmacistDispensedController = PharmacistDispensedController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PharmacistDispensedController.prototype, "getDispensedHistory", null);
__decorate([
    (0, common_1.UseGuards)(firebase_auth_guard_js_1.FirebaseAuthGuard),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PharmacistDispensedController.prototype, "addDispensedRecord", null);
__decorate([
    (0, common_1.Put)(':id/settle-payment'),
    (0, common_1.UseGuards)(firebase_auth_guard_js_1.FirebaseAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PharmacistDispensedController.prototype, "settlePayment", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(firebase_auth_guard_js_1.FirebaseAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PharmacistDispensedController.prototype, "updateDispensedRecord", null);
exports.PharmacistDispensedController = PharmacistDispensedController = __decorate([
    (0, common_1.Controller)('pharmacist/dispensed'),
    __metadata("design:paramtypes", [pharmacist_dispensed_service_js_1.PharmacistDispensedService])
], PharmacistDispensedController);
//# sourceMappingURL=pharmacist-dispensed.controller.js.map
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
exports.PrescriptionsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const prescriptions_service_1 = require("./prescriptions.service");
let PrescriptionsController = class PrescriptionsController {
    prescriptionsService;
    constructor(prescriptionsService) {
        this.prescriptionsService = prescriptionsService;
    }
    async upload(file, customerName, customerPhone, customerAddress, userId) {
        return this.prescriptionsService.uploadPrescription(file, customerName, customerPhone, customerAddress, userId);
    }
    async getAll() {
        return this.prescriptionsService.getAllPrescriptions();
    }
    async update(id, updateData) {
        return this.prescriptionsService.updatePrescription(id, updateData);
    }
};
exports.PrescriptionsController = PrescriptionsController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('prescription', {
        storage: (0, multer_1.memoryStorage)(),
        limits: {
            fileSize: 10 * 1024 * 1024,
        },
        fileFilter: (req, file, cb) => {
            const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
            if (allowed.includes(file.mimetype)) {
                cb(null, true);
            }
            else {
                cb(new Error('Only JPG, PNG, and PDF files are allowed'), false);
            }
        },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('customerName')),
    __param(2, (0, common_1.Body)('customerPhone')),
    __param(3, (0, common_1.Body)('customerAddress')),
    __param(4, (0, common_1.Body)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], PrescriptionsController.prototype, "upload", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PrescriptionsController.prototype, "getAll", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PrescriptionsController.prototype, "update", null);
exports.PrescriptionsController = PrescriptionsController = __decorate([
    (0, common_1.Controller)('prescriptions'),
    __metadata("design:paramtypes", [prescriptions_service_1.PrescriptionsService])
], PrescriptionsController);
//# sourceMappingURL=prescriptions.controller.js.map
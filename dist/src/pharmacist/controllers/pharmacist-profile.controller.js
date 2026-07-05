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
exports.PharmacistProfileController = void 0;
const common_1 = require("@nestjs/common");
const pharmacist_profile_service_js_1 = require("../services/pharmacist-profile.service.js");
let PharmacistProfileController = class PharmacistProfileController {
    profileService;
    constructor(profileService) {
        this.profileService = profileService;
    }
    async getProfile(id) {
        return this.profileService.getProfile(id);
    }
    async updateProfile(id, updateData) {
        return this.profileService.updateProfile(id, updateData);
    }
};
exports.PharmacistProfileController = PharmacistProfileController;
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PharmacistProfileController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PharmacistProfileController.prototype, "updateProfile", null);
exports.PharmacistProfileController = PharmacistProfileController = __decorate([
    (0, common_1.Controller)('pharmacist/profile'),
    __metadata("design:paramtypes", [pharmacist_profile_service_js_1.PharmacistProfileService])
], PharmacistProfileController);
//# sourceMappingURL=pharmacist-profile.controller.js.map
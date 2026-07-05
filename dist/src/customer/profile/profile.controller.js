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
exports.ProfileController = void 0;
const common_1 = require("@nestjs/common");
const profile_service_1 = require("./profile.service");
let ProfileController = class ProfileController {
    profileService;
    constructor(profileService) {
        this.profileService = profileService;
    }
    async getProfile(uid) {
        return this.profileService.getProfile(uid);
    }
    async updateProfile(uid, body) {
        return this.profileService.updateProfile(uid, body);
    }
};
exports.ProfileController = ProfileController;
__decorate([
    (0, common_1.Get)(':uid'),
    __param(0, (0, common_1.Param)('uid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProfileController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Put)(':uid'),
    __param(0, (0, common_1.Param)('uid')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProfileController.prototype, "updateProfile", null);
exports.ProfileController = ProfileController = __decorate([
    (0, common_1.Controller)('profile'),
    __metadata("design:paramtypes", [profile_service_1.ProfileService])
], ProfileController);
//# sourceMappingURL=profile.controller.js.map
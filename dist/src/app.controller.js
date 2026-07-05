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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const app_service_1 = require("./app.service");
const firebase_service_js_1 = require("./shared/firebase/firebase.service.js");
let AppController = class AppController {
    appService;
    firebaseService;
    constructor(appService, firebaseService) {
        this.appService = appService;
        this.firebaseService = firebaseService;
    }
    getHello() {
        return this.appService.getHello();
    }
    async setAdmin() {
        await this.firebaseService.getAdmin().setCustomUserClaims('r0xXWdAeqGagF3MSCGc9pXcghu73', { role: 'admin' });
        return { success: true };
    }
    async checkAdmin() {
        const user = await this.firebaseService.getAdmin().getUser('r0xXWdAeqGagF3MSCGc9pXcghu73');
        return { customClaims: user.customClaims };
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], AppController.prototype, "getHello", null);
__decorate([
    (0, common_1.Get)('set-admin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "setAdmin", null);
__decorate([
    (0, common_1.Get)('check-admin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "checkAdmin", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [app_service_1.AppService,
        firebase_service_js_1.FirebaseService])
], AppController);
//# sourceMappingURL=app.controller.js.map
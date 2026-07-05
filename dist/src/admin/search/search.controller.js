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
exports.AdminSearchController = void 0;
const common_1 = require("@nestjs/common");
const search_service_js_1 = require("../../shared/search/search.service.js");
const sync_service_js_1 = require("../../shared/search/sync.service.js");
const firebase_auth_guard_js_1 = require("../../auth/firebase-auth.guard.js");
let AdminSearchController = class AdminSearchController {
    searchService;
    syncService;
    constructor(searchService, syncService) {
        this.searchService = searchService;
        this.syncService = syncService;
    }
    search(query) {
        if (!query || query.trim() === '') {
            return Promise.resolve({ results: [], total: 0 });
        }
        return this.searchService.search(query.trim());
    }
    syncProducts() {
        return this.syncService.syncAllProducts();
    }
    getAnalytics() {
        return this.searchService.getSearchAnalytics();
    }
};
exports.AdminSearchController = AdminSearchController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminSearchController.prototype, "search", null);
__decorate([
    (0, common_1.UseGuards)(firebase_auth_guard_js_1.FirebaseAuthGuard),
    (0, common_1.Get)('sync'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminSearchController.prototype, "syncProducts", null);
__decorate([
    (0, common_1.UseGuards)(firebase_auth_guard_js_1.FirebaseAuthGuard),
    (0, common_1.Get)('analytics'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminSearchController.prototype, "getAnalytics", null);
exports.AdminSearchController = AdminSearchController = __decorate([
    (0, common_1.Controller)('admin/search'),
    __metadata("design:paramtypes", [search_service_js_1.SearchService,
        sync_service_js_1.SyncService])
], AdminSearchController);
//# sourceMappingURL=search.controller.js.map
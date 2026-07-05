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
exports.PharmacistInventoryController = void 0;
const common_1 = require("@nestjs/common");
const pharmacist_inventory_service_js_1 = require("../services/pharmacist-inventory.service.js");
let PharmacistInventoryController = class PharmacistInventoryController {
    inventoryService;
    constructor(inventoryService) {
        this.inventoryService = inventoryService;
    }
    async getInventory() {
        return this.inventoryService.getInventory();
    }
    async addInventoryItem(itemData) {
        return this.inventoryService.addInventoryItem(itemData);
    }
    async updateInventoryItem(id, updateData) {
        return this.inventoryService.updateInventoryItem(id, updateData);
    }
    async deleteInventoryItem(id) {
        return this.inventoryService.deleteInventoryItem(id);
    }
};
exports.PharmacistInventoryController = PharmacistInventoryController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PharmacistInventoryController.prototype, "getInventory", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PharmacistInventoryController.prototype, "addInventoryItem", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PharmacistInventoryController.prototype, "updateInventoryItem", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PharmacistInventoryController.prototype, "deleteInventoryItem", null);
exports.PharmacistInventoryController = PharmacistInventoryController = __decorate([
    (0, common_1.Controller)('pharmacist/inventory'),
    __metadata("design:paramtypes", [pharmacist_inventory_service_js_1.PharmacistInventoryService])
], PharmacistInventoryController);
//# sourceMappingURL=pharmacist-inventory.controller.js.map
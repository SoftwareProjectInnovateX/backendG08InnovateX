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
exports.ProductsController = void 0;
const common_1 = require("@nestjs/common");
const products_service_1 = require("./products.service");
let ProductsController = class ProductsController {
    productsService;
    constructor(productsService) {
        this.productsService = productsService;
    }
    async getProducts(category) {
        return this.productsService.getProducts(category);
    }
    async getPendingProducts() {
        return this.productsService.getPendingProducts();
    }
    async getAllPharmacistProducts() {
        return this.productsService.getAllPharmacistProducts();
    }
    async addProduct(body) {
        return this.productsService.addProduct(body);
    }
    async approvePending(id) {
        return this.productsService.approvePending(id);
    }
    async updateVisibility(id, body) {
        return this.productsService.updateVisibility(id, body.visibility);
    }
    async decrementStock(productCode, body) {
        if (!body.quantity || body.quantity < 1 || !Number.isInteger(body.quantity)) {
            throw new common_1.BadRequestException('Quantity must be a positive integer');
        }
        if (!productCode?.trim()) {
            throw new common_1.BadRequestException('Product code is required');
        }
        return this.productsService.decrementStock(productCode, body.quantity);
    }
    async incrementStock(productCode, body) {
        if (!body.quantity || body.quantity < 1 || !Number.isInteger(body.quantity)) {
            throw new common_1.BadRequestException('Quantity must be a positive integer');
        }
        if (!productCode?.trim()) {
            throw new common_1.BadRequestException('Product code is required');
        }
        return this.productsService.incrementStock(productCode, body.quantity);
    }
};
exports.ProductsController = ProductsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "getProducts", null);
__decorate([
    (0, common_1.Get)('pending'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "getPendingProducts", null);
__decorate([
    (0, common_1.Get)('all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "getAllPharmacistProducts", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "addProduct", null);
__decorate([
    (0, common_1.Patch)('pending/:id/approve'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "approvePending", null);
__decorate([
    (0, common_1.Patch)(':id/visibility'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "updateVisibility", null);
__decorate([
    (0, common_1.Put)(':productCode/decrement-stock'),
    __param(0, (0, common_1.Param)('productCode')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "decrementStock", null);
__decorate([
    (0, common_1.Put)(':productCode/increment-stock'),
    __param(0, (0, common_1.Param)('productCode')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "incrementStock", null);
exports.ProductsController = ProductsController = __decorate([
    (0, common_1.Controller)('products'),
    __metadata("design:paramtypes", [products_service_1.ProductsService])
], ProductsController);
//# sourceMappingURL=products.controller.js.map
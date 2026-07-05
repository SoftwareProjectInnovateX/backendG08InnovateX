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
exports.SupplierProductsController = void 0;
const common_1 = require("@nestjs/common");
const supplier_products_service_1 = require("./supplier-products.service");
const create_product_dto_1 = require("./dto/create-product.dto");
const update_product_dto_1 = require("./dto/update-product.dto");
const firebase_auth_guard_js_1 = require("../../auth/firebase-auth.guard.js");
const roles_guard_js_1 = require("../../auth/roles.guard.js");
const roles_decorator_js_1 = require("../../auth/roles.decorator.js");
let SupplierProductsController = class SupplierProductsController {
    productsService;
    constructor(productsService) {
        this.productsService = productsService;
    }
    getProducts(supplierId) {
        return this.productsService.getProducts(supplierId);
    }
    getPendingProducts(supplierId) {
        return this.productsService.getPendingProducts(supplierId);
    }
    createProduct(supplierId, supplierName, dto) {
        return this.productsService.createProduct(supplierId, supplierName, dto);
    }
    updateProduct(productId, dto) {
        return this.productsService.updateProduct(productId, dto);
    }
    deleteProduct(productId) {
        return this.productsService.deleteProduct(productId);
    }
};
exports.SupplierProductsController = SupplierProductsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('supplierId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SupplierProductsController.prototype, "getProducts", null);
__decorate([
    (0, common_1.Get)('pending'),
    __param(0, (0, common_1.Query)('supplierId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SupplierProductsController.prototype, "getPendingProducts", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Query)('supplierId')),
    __param(1, (0, common_1.Query)('supplierName')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_product_dto_1.CreateProductDto]),
    __metadata("design:returntype", void 0)
], SupplierProductsController.prototype, "createProduct", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_product_dto_1.UpdateProductDto]),
    __metadata("design:returntype", void 0)
], SupplierProductsController.prototype, "updateProduct", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SupplierProductsController.prototype, "deleteProduct", null);
exports.SupplierProductsController = SupplierProductsController = __decorate([
    (0, common_1.Controller)('supplier/products'),
    (0, common_1.UseGuards)(firebase_auth_guard_js_1.FirebaseAuthGuard, roles_guard_js_1.RolesGuard),
    (0, roles_decorator_js_1.Roles)('supplier'),
    __metadata("design:paramtypes", [supplier_products_service_1.SupplierProductsService])
], SupplierProductsController);
//# sourceMappingURL=supplier-products.controller.js.map
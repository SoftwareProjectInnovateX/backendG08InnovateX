"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupplierProductsModule = void 0;
const common_1 = require("@nestjs/common");
const supplier_products_controller_1 = require("./supplier-products.controller");
const supplier_products_service_1 = require("./supplier-products.service");
const firebase_module_1 = require("../../shared/firebase/firebase.module");
let SupplierProductsModule = class SupplierProductsModule {
};
exports.SupplierProductsModule = SupplierProductsModule;
exports.SupplierProductsModule = SupplierProductsModule = __decorate([
    (0, common_1.Module)({
        imports: [firebase_module_1.FirebaseModule],
        controllers: [supplier_products_controller_1.SupplierProductsController],
        providers: [supplier_products_service_1.SupplierProductsService],
    })
], SupplierProductsModule);
//# sourceMappingURL=supplier-products.module.js.map
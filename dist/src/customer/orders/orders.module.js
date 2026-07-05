"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerOrdersModule = void 0;
const common_1 = require("@nestjs/common");
const orders_controller_1 = require("./orders.controller");
const orders_service_1 = require("./orders.service");
const firebase_module_1 = require("../../shared/firebase/firebase.module");
const products_module_1 = require("../products/products.module");
const loyalty_module_1 = require("../loyalty/loyalty.module");
const mail_module_1 = require("../../shared/mail/mail.module");
let CustomerOrdersModule = class CustomerOrdersModule {
};
exports.CustomerOrdersModule = CustomerOrdersModule;
exports.CustomerOrdersModule = CustomerOrdersModule = __decorate([
    (0, common_1.Module)({
        imports: [firebase_module_1.FirebaseModule, products_module_1.ProductsModule, loyalty_module_1.LoyaltyModule, mail_module_1.MailModule],
        controllers: [orders_controller_1.OrdersController],
        providers: [orders_service_1.OrdersService],
    })
], CustomerOrdersModule);
//# sourceMappingURL=orders.module.js.map
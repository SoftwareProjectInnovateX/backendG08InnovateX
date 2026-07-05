"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const serve_static_1 = require("@nestjs/serve-static");
const path_1 = require("path");
const app_controller_js_1 = require("./app.controller.js");
const app_service_js_1 = require("./app.service.js");
const schedule_1 = require("@nestjs/schedule");
const firebase_module_js_1 = require("./shared/firebase/firebase.module.js");
const counters_module_js_1 = require("./shared/counters/counters.module.js");
const mail_module_js_1 = require("./shared/mail/mail.module.js");
const users_module_js_1 = require("./admin/users/users.module.js");
const orders_module_js_1 = require("./admin/orders/orders.module.js");
const notifications_module_js_1 = require("./admin/notifications/notifications.module.js");
const search_module_js_1 = require("./admin/search/search.module.js");
const account_requests_module_js_1 = require("./admin/account-requests/account-requests.module.js");
const chat_module_js_1 = require("./admin/chat/chat.module.js");
const admin_product_approval_module_js_1 = require("./admin/adminProducts/admin-product-approval.module.js");
const forecast_module_js_1 = require("./admin/forecast/forecast.module.js");
const supplier_products_module_js_1 = require("./supplier/products/supplier-products.module.js");
const purchase_orders_module_js_1 = require("./supplier/purchase-orders/purchase-orders.module.js");
const invoices_module_js_1 = require("./supplier/invoices/invoices.module.js");
const ai_analytics_module_js_1 = require("./supplier/ai-analytics/ai-analytics.module.js");
const prescriptions_module_js_1 = require("./pharmacist/prescriptions/prescriptions.module.js");
const pharmacist_module_js_1 = require("./pharmacist/pharmacist.module.js");
const products_module_js_1 = require("./pharmacist/products/products.module.js");
const ai_module_js_1 = require("./pharmacist/AIfeature/ai.module.js");
const cart_module_js_1 = require("./customer/cart/cart.module.js");
const orders_module_js_2 = require("./customer/orders/orders.module.js");
const products_module_js_2 = require("./customer/products/products.module.js");
const returns_module_js_1 = require("./customer/returns/returns.module.js");
const profile_module_js_1 = require("./customer/profile/profile.module.js");
const brands_module_js_1 = require("./customer/brands/brands.module.js");
const contact_module_js_1 = require("./customer/contact/contact.module.js");
const loyalty_module_js_1 = require("./customer/loyalty/loyalty.module.js");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(__dirname, '..', 'uploads'),
                serveRoot: '/uploads',
            }),
            firebase_module_js_1.FirebaseModule,
            counters_module_js_1.CountersModule,
            mail_module_js_1.MailModule,
            users_module_js_1.UsersModule,
            orders_module_js_1.OrdersModule,
            notifications_module_js_1.NotificationsModule,
            search_module_js_1.AdminSearchModule,
            account_requests_module_js_1.AccountRequestsModule,
            chat_module_js_1.ChatModule,
            admin_product_approval_module_js_1.AdminProductApprovalModule,
            schedule_1.ScheduleModule.forRoot(),
            forecast_module_js_1.ForecastModule,
            supplier_products_module_js_1.SupplierProductsModule,
            purchase_orders_module_js_1.PurchaseOrdersModule,
            invoices_module_js_1.InvoicesModule,
            ai_analytics_module_js_1.AiAnalyticsModule,
            prescriptions_module_js_1.PrescriptionsModule,
            pharmacist_module_js_1.PharmacistModule,
            products_module_js_1.PharmacistProductsModule,
            ai_module_js_1.AiModule,
            cart_module_js_1.CartModule,
            orders_module_js_2.CustomerOrdersModule,
            products_module_js_2.ProductsModule,
            returns_module_js_1.ReturnsModule,
            profile_module_js_1.ProfileModule,
            brands_module_js_1.BrandsModule,
            contact_module_js_1.ContactModule,
            loyalty_module_js_1.LoyaltyModule,
        ],
        controllers: [app_controller_js_1.AppController],
        providers: [app_service_js_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map
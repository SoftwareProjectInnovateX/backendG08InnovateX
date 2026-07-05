"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PharmacistModule = void 0;
const common_1 = require("@nestjs/common");
const firebase_module_js_1 = require("../shared/firebase/firebase.module.js");
const counters_module_js_1 = require("../shared/counters/counters.module.js");
const loyalty_module_js_1 = require("../customer/loyalty/loyalty.module.js");
const pharmacist_profile_service_js_1 = require("./services/pharmacist-profile.service.js");
const pharmacist_profile_controller_js_1 = require("./controllers/pharmacist-profile.controller.js");
const pharmacist_inventory_service_js_1 = require("./services/pharmacist-inventory.service.js");
const pharmacist_inventory_controller_js_1 = require("./controllers/pharmacist-inventory.controller.js");
const pharmacist_patients_service_js_1 = require("./services/pharmacist-patients.service.js");
const pharmacist_patients_controller_js_1 = require("./controllers/pharmacist-patients.controller.js");
const pharmacist_dispensed_service_js_1 = require("./services/pharmacist-dispensed.service.js");
const pharmacist_dispensed_controller_js_1 = require("./controllers/pharmacist-dispensed.controller.js");
const pharmacist_system_service_js_1 = require("./services/pharmacist-system.service.js");
const pharmacist_system_controller_js_1 = require("./controllers/pharmacist-system.controller.js");
const pharmacist_orders_service_js_1 = require("./services/pharmacist-orders.service.js");
const pharmacist_orders_controller_js_1 = require("./controllers/pharmacist-orders.controller.js");
const pharmacist_returns_service_js_1 = require("./services/pharmacist-returns.service.js");
const pharmacist_returns_controller_js_1 = require("./controllers/pharmacist-returns.controller.js");
let PharmacistModule = class PharmacistModule {
};
exports.PharmacistModule = PharmacistModule;
exports.PharmacistModule = PharmacistModule = __decorate([
    (0, common_1.Module)({
        imports: [firebase_module_js_1.FirebaseModule, counters_module_js_1.CountersModule, loyalty_module_js_1.LoyaltyModule],
        controllers: [
            pharmacist_profile_controller_js_1.PharmacistProfileController,
            pharmacist_inventory_controller_js_1.PharmacistInventoryController,
            pharmacist_patients_controller_js_1.PharmacistPatientsController,
            pharmacist_dispensed_controller_js_1.PharmacistDispensedController,
            pharmacist_system_controller_js_1.PharmacistSystemController,
            pharmacist_orders_controller_js_1.PharmacistOrdersController,
            pharmacist_returns_controller_js_1.PharmacistReturnsController,
        ],
        providers: [
            pharmacist_profile_service_js_1.PharmacistProfileService,
            pharmacist_inventory_service_js_1.PharmacistInventoryService,
            pharmacist_patients_service_js_1.PharmacistPatientsService,
            pharmacist_dispensed_service_js_1.PharmacistDispensedService,
            pharmacist_system_service_js_1.PharmacistSystemService,
            pharmacist_orders_service_js_1.PharmacistOrdersService,
            pharmacist_returns_service_js_1.PharmacistReturnsService,
        ],
    })
], PharmacistModule);
//# sourceMappingURL=pharmacist.module.js.map
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForecastModule = void 0;
const common_1 = require("@nestjs/common");
const forecast_controller_js_1 = require("./forecast.controller.js");
const forecast_service_js_1 = require("./forecast.service.js");
const forecast_scheduler_js_1 = require("./forecast.scheduler.js");
const firebase_module_js_1 = require("../../shared/firebase/firebase.module.js");
let ForecastModule = class ForecastModule {
};
exports.ForecastModule = ForecastModule;
exports.ForecastModule = ForecastModule = __decorate([
    (0, common_1.Module)({
        imports: [firebase_module_js_1.FirebaseModule],
        controllers: [forecast_controller_js_1.ForecastController],
        providers: [forecast_service_js_1.ForecastService, forecast_scheduler_js_1.ForecastScheduler],
        exports: [forecast_service_js_1.ForecastService],
    })
], ForecastModule);
//# sourceMappingURL=forecast.module.js.map
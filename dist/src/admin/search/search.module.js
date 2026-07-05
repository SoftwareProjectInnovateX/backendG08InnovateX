"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminSearchModule = void 0;
const common_1 = require("@nestjs/common");
const search_controller_js_1 = require("./search.controller.js");
const search_module_js_1 = require("../../shared/search/search.module.js");
const firebase_module_js_1 = require("../../shared/firebase/firebase.module.js");
const firebase_auth_guard_js_1 = require("../../auth/firebase-auth.guard.js");
let AdminSearchModule = class AdminSearchModule {
};
exports.AdminSearchModule = AdminSearchModule;
exports.AdminSearchModule = AdminSearchModule = __decorate([
    (0, common_1.Module)({
        imports: [search_module_js_1.SearchModule, firebase_module_js_1.FirebaseModule],
        controllers: [search_controller_js_1.AdminSearchController],
        providers: [firebase_auth_guard_js_1.FirebaseAuthGuard],
    })
], AdminSearchModule);
//# sourceMappingURL=search.module.js.map
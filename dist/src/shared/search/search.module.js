"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchModule = void 0;
const common_1 = require("@nestjs/common");
const search_service_js_1 = require("./search.service.js");
const sync_service_js_1 = require("./sync.service.js");
const firebase_module_js_1 = require("../../shared/firebase/firebase.module.js");
const firebase_auth_guard_js_1 = require("../../auth/firebase-auth.guard.js");
let SearchModule = class SearchModule {
};
exports.SearchModule = SearchModule;
exports.SearchModule = SearchModule = __decorate([
    (0, common_1.Module)({
        imports: [firebase_module_js_1.FirebaseModule],
        controllers: [],
        providers: [search_service_js_1.SearchService, sync_service_js_1.SyncService, firebase_auth_guard_js_1.FirebaseAuthGuard],
        exports: [search_service_js_1.SearchService, sync_service_js_1.SyncService],
    })
], SearchModule);
//# sourceMappingURL=search.module.js.map
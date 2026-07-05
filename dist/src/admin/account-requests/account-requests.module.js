"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountRequestsModule = void 0;
const common_1 = require("@nestjs/common");
const account_requests_controller_js_1 = require("./account-requests.controller.js");
const account_requests_service_js_1 = require("./account-requests.service.js");
const firebase_module_js_1 = require("../../shared/firebase/firebase.module.js");
const mail_module_js_1 = require("../../shared/mail/mail.module.js");
let AccountRequestsModule = class AccountRequestsModule {
};
exports.AccountRequestsModule = AccountRequestsModule;
exports.AccountRequestsModule = AccountRequestsModule = __decorate([
    (0, common_1.Module)({
        imports: [firebase_module_js_1.FirebaseModule, mail_module_js_1.MailModule],
        controllers: [account_requests_controller_js_1.AccountRequestsController],
        providers: [account_requests_service_js_1.AccountRequestsService],
    })
], AccountRequestsModule);
//# sourceMappingURL=account-requests.module.js.map
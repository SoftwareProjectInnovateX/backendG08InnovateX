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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CountersService = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../../shared/firebase/firebase.service");
let CountersService = class CountersService {
    firebaseService;
    constructor(firebaseService) {
        this.firebaseService = firebaseService;
    }
    async generateProductCode() {
        const db = this.firebaseService.getDb();
        const counterRef = db.doc('counters/productCode');
        const nextNumber = await db.runTransaction(async (transaction) => {
            const counterSnap = await transaction.get(counterRef);
            if (!counterSnap.exists) {
                transaction.set(counterRef, { current: 1 });
                return 1;
            }
            const next = (counterSnap.data()?.current || 0) + 1;
            transaction.update(counterRef, { current: next });
            return next;
        });
        return `P${String(nextNumber).padStart(3, '0')}`;
    }
};
exports.CountersService = CountersService;
exports.CountersService = CountersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService])
], CountersService);
//# sourceMappingURL=counters.service.js.map
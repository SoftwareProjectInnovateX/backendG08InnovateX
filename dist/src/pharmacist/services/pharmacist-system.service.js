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
exports.PharmacistSystemService = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_js_1 = require("../../shared/firebase/firebase.service.js");
let PharmacistSystemService = class PharmacistSystemService {
    firebaseService;
    constructor(firebaseService) {
        this.firebaseService = firebaseService;
    }
    async resetSystemData() {
        const db = this.firebaseService.getDb();
        const rxSnapshot = await db.collection('pharmacistPrescriptions').get();
        const rxBatch = db.batch();
        rxSnapshot.docs.forEach((doc) => {
            rxBatch.delete(doc.ref);
        });
        await rxBatch.commit();
        const dispSnapshot = await db.collection('pharmacistDispensed').get();
        const dispBatch = db.batch();
        dispSnapshot.docs.forEach((doc) => {
            dispBatch.delete(doc.ref);
        });
        await dispBatch.commit();
        return { success: true, message: 'System data reset successfully' };
    }
};
exports.PharmacistSystemService = PharmacistSystemService;
exports.PharmacistSystemService = PharmacistSystemService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_js_1.FirebaseService])
], PharmacistSystemService);
//# sourceMappingURL=pharmacist-system.service.js.map
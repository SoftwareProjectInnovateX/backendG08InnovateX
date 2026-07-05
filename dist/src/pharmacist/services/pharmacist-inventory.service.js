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
exports.PharmacistInventoryService = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_js_1 = require("../../shared/firebase/firebase.service.js");
let PharmacistInventoryService = class PharmacistInventoryService {
    firebaseService;
    collectionName = 'adminProducts';
    constructor(firebaseService) {
        this.firebaseService = firebaseService;
    }
    async getInventory() {
        const db = this.firebaseService.getDb();
        const snapshot = await db.collection(this.collectionName).get();
        return snapshot.docs.map(doc => ({ firebaseId: doc.id, id: doc.id, ...doc.data() }));
    }
    async addInventoryItem(itemData) {
        const db = this.firebaseService.getDb();
        const docRef = await db.collection(this.collectionName).add(itemData);
        return { id: docRef.id, ...itemData };
    }
    async updateInventoryItem(id, updateData) {
        const db = this.firebaseService.getDb();
        const docRef = db.collection(this.collectionName).doc(id);
        await docRef.update(updateData);
        return { id, ...updateData };
    }
    async deleteInventoryItem(id) {
        const db = this.firebaseService.getDb();
        const docRef = db.collection(this.collectionName).doc(id);
        await docRef.delete();
        return { id };
    }
};
exports.PharmacistInventoryService = PharmacistInventoryService;
exports.PharmacistInventoryService = PharmacistInventoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_js_1.FirebaseService])
], PharmacistInventoryService);
//# sourceMappingURL=pharmacist-inventory.service.js.map
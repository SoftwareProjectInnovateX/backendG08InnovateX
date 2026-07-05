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
exports.BrandsService = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../../shared/firebase/firebase.service");
const firestore_1 = require("firebase-admin/firestore");
let BrandsService = class BrandsService {
    firebaseService;
    cache = null;
    TTL = 60_000;
    constructor(firebaseService) {
        this.firebaseService = firebaseService;
    }
    async getBrands() {
        if (this.cache && Date.now() - this.cache.ts < this.TTL) {
            return this.cache.data;
        }
        const db = this.firebaseService.getDb();
        const snapshot = await db
            .collection('brands')
            .orderBy('createdAt', 'desc')
            .get();
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        this.cache = { data, ts: Date.now() };
        return data;
    }
    async addBrand(body) {
        const db = this.firebaseService.getDb();
        this.cache = null;
        const docRef = await db.collection('brands').add({
            name: body.name,
            tagline: body.tagline || '',
            description: body.description,
            category: body.category,
            imageUrl: body.imageUrl || '',
            rating: Number(body.rating) || 0,
            products: Number(body.products) || 0,
            established: Number(body.established) || 0,
            country: body.country || '',
            createdAt: firestore_1.FieldValue.serverTimestamp(),
        });
        return { success: true, id: docRef.id };
    }
};
exports.BrandsService = BrandsService;
exports.BrandsService = BrandsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService])
], BrandsService);
//# sourceMappingURL=brands.service.js.map
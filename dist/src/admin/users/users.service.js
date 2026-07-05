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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_js_1 = require("../../shared/firebase/firebase.service.js");
let UsersService = class UsersService {
    firebaseService;
    constructor(firebaseService) {
        this.firebaseService = firebaseService;
    }
    async getAllUsers() {
        const db = this.firebaseService.getDb();
        try {
            const snapshot = await db
                .collection('users')
                .where('role', '==', 'customer')
                .orderBy('createdAt', 'desc')
                .get();
            return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        }
        catch (err) {
            console.warn('orderBy/where failed, falling back to full fetch:', err.message);
            const snapshot = await db.collection('users').get();
            const allDocs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
            return allDocs
                .filter((u) => !u.role || u.role === 'customer')
                .sort((a, b) => {
                const aTime = a.createdAt?._seconds ?? a.createdAt?.seconds ?? 0;
                const bTime = b.createdAt?._seconds ?? b.createdAt?.seconds ?? 0;
                return bTime - aTime;
            });
        }
    }
    async getUserById(id) {
        const db = this.firebaseService.getDb();
        const docSnap = await db.collection('users').doc(id).get();
        if (!docSnap.exists)
            throw new common_1.NotFoundException('User not found');
        return { id: docSnap.id, ...docSnap.data() };
    }
    async addLoyaltyPoints(id, points) {
        const db = this.firebaseService.getDb();
        const ref = db.collection('users').doc(id);
        const snap = await ref.get();
        if (!snap.exists)
            throw new common_1.NotFoundException('User not found');
        const current = (snap.data()?.loyaltyPoints || 0) + points;
        await ref.update({ loyaltyPoints: current });
        return { success: true, loyaltyPoints: current };
    }
    async updateStatus(id, status) {
        const db = this.firebaseService.getDb();
        const ref = db.collection('users').doc(id);
        const snap = await ref.get();
        if (!snap.exists)
            throw new common_1.NotFoundException('User not found');
        await ref.update({ status });
        return { success: true, status };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_js_1.FirebaseService])
], UsersService);
//# sourceMappingURL=users.service.js.map
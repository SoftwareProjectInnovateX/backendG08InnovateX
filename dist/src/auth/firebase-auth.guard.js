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
exports.FirebaseAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_js_1 = require("../shared/firebase/firebase.service.js");
let FirebaseAuthGuard = class FirebaseAuthGuard {
    firebaseService;
    constructor(firebaseService) {
        this.firebaseService = firebaseService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new common_1.UnauthorizedException('No token provided');
        }
        const token = authHeader.split('Bearer ')[1];
        try {
            const firebaseAuth = this.firebaseService.getAdmin();
            const decodedToken = await firebaseAuth.verifyIdToken(token);
            const uid = decodedToken.uid;
            const db = this.firebaseService.getDb();
            let role = decodedToken.role;
            if (!role) {
                const adminDoc = await db.collection('admins').doc(uid).get();
                if (adminDoc.exists) {
                    role = adminDoc.data()?.role || 'admin';
                    console.log(`[FirebaseAuthGuard] Found in 'admins' collection. Role: ${role}`);
                }
                else {
                    const userDoc = await db.collection('users').doc(uid).get();
                    if (userDoc.exists) {
                        role = userDoc.data()?.role || 'customer';
                        console.log(`[FirebaseAuthGuard] Found in 'users' collection. Role: ${role}`);
                    }
                    else {
                        const supplierDoc = await db.collection('suppliers').doc(uid).get();
                        if (supplierDoc.exists) {
                            role = 'supplier';
                            console.log(`[FirebaseAuthGuard] Found in 'suppliers' collection.`);
                        }
                        else {
                            const pharmacistDoc = await db.collection('pharmacists').doc(uid).get();
                            if (pharmacistDoc.exists) {
                                role = 'pharmacist';
                                console.log(`[FirebaseAuthGuard] Found in 'pharmacists' collection.`);
                            }
                        }
                    }
                }
            }
            if (!role) {
                console.warn(`[FirebaseAuthGuard] No role found for UID: ${uid}`);
            }
            let isActive = true;
            if (role === 'customer') {
                const userDoc = await db.collection('users').doc(uid).get();
                isActive = userDoc.data()?.status === 'active';
            }
            else if (role === 'supplier') {
                const supplierDoc = await db.collection('suppliers').doc(uid).get();
                isActive = supplierDoc.data()?.status === 'active';
            }
            if (!isActive) {
                throw new common_1.UnauthorizedException('Your account is suspended or pending approval.');
            }
            request.user = {
                uid: uid,
                email: decodedToken.email,
                role: role,
            };
            return true;
        }
        catch (error) {
            console.error('Auth Guard Error:', error);
            throw new common_1.UnauthorizedException('Invalid or expired token');
        }
    }
};
exports.FirebaseAuthGuard = FirebaseAuthGuard;
exports.FirebaseAuthGuard = FirebaseAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_js_1.FirebaseService])
], FirebaseAuthGuard);
//# sourceMappingURL=firebase-auth.guard.js.map
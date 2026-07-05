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
exports.PharmacistPatientsService = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_js_1 = require("../../shared/firebase/firebase.service.js");
let PharmacistPatientsService = class PharmacistPatientsService {
    firebaseService;
    collectionName = 'users';
    constructor(firebaseService) {
        this.firebaseService = firebaseService;
    }
    async getPatients() {
        const db = this.firebaseService.getDb();
        const snapshot = await db.collection(this.collectionName).get();
        return snapshot.docs.map(doc => ({ firebaseId: doc.id, id: doc.id, ...doc.data() }));
    }
    async addPatient(patientData) {
        const db = this.firebaseService.getDb();
        const docRef = await db.collection(this.collectionName).add(patientData);
        return { id: docRef.id, ...patientData };
    }
    async updatePatient(id, updateData) {
        const db = this.firebaseService.getDb();
        const docRef = db.collection(this.collectionName).doc(id);
        await docRef.update(updateData);
        return { id, ...updateData };
    }
};
exports.PharmacistPatientsService = PharmacistPatientsService;
exports.PharmacistPatientsService = PharmacistPatientsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_js_1.FirebaseService])
], PharmacistPatientsService);
//# sourceMappingURL=pharmacist-patients.service.js.map
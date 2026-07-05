"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrescriptionsService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = __importStar(require("nodemailer"));
const admin = __importStar(require("firebase-admin"));
const cloudinary_1 = require("cloudinary");
let PrescriptionsService = class PrescriptionsService {
    constructor() {
        cloudinary_1.v2.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
    }
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
    get db() {
        return admin.firestore();
    }
    uploadToCloudinary(file) {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary_1.v2.uploader.upload_stream({
                folder: 'prescriptions',
                resource_type: 'auto',
            }, (error, result) => {
                if (error)
                    return reject(error);
                if (!result)
                    return reject(new Error('Cloudinary upload returned no result'));
                resolve(result.secure_url);
            });
            uploadStream.end(file.buffer);
        });
    }
    async uploadPrescription(file, customerName, customerPhone, customerAddress, userId) {
        const imageUrl = await this.uploadToCloudinary(file);
        const docRef = await this.db.collection('prescriptions').add({
            customerName,
            customerPhone,
            customerAddress,
            userId: userId || null,
            imageUrl,
            status: 'Pending',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        try {
            await this.transporter.sendMail({
                from: `"MediCare Pharmacy" <${process.env.EMAIL_USER}>`,
                to: process.env.PHARMACIST_EMAIL,
                subject: '📋 New Prescription Uploaded',
                html: `
          <div style="font-family:Arial,sans-serif;padding:20px;">
            <h2 style="color:#16a34a;">New Prescription Received</h2>
            <p><b>Name:</b> ${customerName}</p>
            <p><b>Phone:</b> ${customerPhone}</p>
            <p><b>Address:</b> ${customerAddress}</p>
            <p><b>Status:</b> Pending</p>
            <p><b>Image:</b> <a href="${imageUrl}">View Prescription</a></p>
          </div>
        `,
            });
        }
        catch (emailErr) {
            console.warn('Failed to send pharmacist email notification:', emailErr.message);
        }
        return {
            prescription: {
                id: docRef.id,
                customerName,
                customerPhone,
                customerAddress,
                imageUrl,
                status: 'Pending',
            },
        };
    }
    async getAllPrescriptions() {
        const snap = await this.db
            .collection('prescriptions')
            .orderBy('createdAt', 'desc')
            .get();
        return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }
    async updatePrescription(id, updateData) {
        await this.db.collection('prescriptions').doc(id).update(updateData);
        return { success: true };
    }
};
exports.PrescriptionsService = PrescriptionsService;
exports.PrescriptionsService = PrescriptionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PrescriptionsService);
//# sourceMappingURL=prescriptions.service.js.map
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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrescriptionController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const nodemailer = __importStar(require("nodemailer"));
const cloudinary_1 = require("cloudinary");
const admin = __importStar(require("firebase-admin"));
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
function uploadToCloudinary(file) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary_1.v2.uploader.upload_stream({
            folder: 'prescriptions',
            resource_type: 'auto',
        }, (error, result) => {
            if (error)
                return reject(error);
            if (!result)
                return reject(new Error('Cloudinary upload returned no result'));
            resolve(result.secure_url);
        });
        stream.end(file.buffer);
    });
}
let PrescriptionController = class PrescriptionController {
    async uploadPrescription(file, body) {
        if (!file) {
            throw new common_1.BadRequestException('No prescription file provided');
        }
        const { customerName, customerPhone, customerAddress, userId } = body;
        if (!customerName || !customerPhone) {
            throw new common_1.BadRequestException('customerName and customerPhone are required');
        }
        const requiredEnvVars = [
            'EMAIL_USER', 'EMAIL_PASS', 'PHARMACIST_EMAIL',
            'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET',
        ];
        for (const envVar of requiredEnvVars) {
            if (!process.env[envVar]) {
                throw new common_1.InternalServerErrorException(`Missing environment variable: ${envVar}`);
            }
        }
        try {
            const imageUrl = await uploadToCloudinary(file);
            const db = admin.firestore();
            const docRef = await db.collection('prescriptions').add({
                fileName: file.originalname,
                fileSize: file.size,
                mimeType: file.mimetype,
                imageUrl,
                status: 'Pending',
                customerName,
                customerPhone,
                customerAddress: customerAddress || '',
                userId: userId || null,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });
            await transporter.sendMail({
                from: `"MediCareX" <${process.env.EMAIL_USER}>`,
                to: process.env.PHARMACIST_EMAIL,
                subject: 'New Prescription Uploaded - MediCareX',
                html: `
          <h2>New Prescription Uploaded</h2>
          <p><b>Customer Name:</b> ${customerName}</p>
          <p><b>Phone:</b> ${customerPhone}</p>
          <p><b>Address:</b> ${customerAddress || 'N/A'}</p>
          <p><b>File:</b> ${file.originalname} (${(file.size / 1024 / 1024).toFixed(2)} MB)</p>
          <p><b>Upload Time:</b> ${new Date().toLocaleString()}</p>
          <p>
            <a href="${imageUrl}">View Prescription Image</a>
          </p>
        `,
                attachments: [
                    {
                        filename: file.originalname,
                        content: file.buffer,
                    },
                ],
            });
            return {
                success: true,
                message: 'Prescription uploaded and pharmacist notified',
                prescription: {
                    id: docRef.id,
                    fileName: file.originalname,
                    fileSize: file.size,
                    mimeType: file.mimetype,
                    imageUrl,
                    status: 'Pending',
                    customerName,
                    customerPhone,
                    customerAddress: customerAddress || '',
                    userId: userId || null,
                    createdAt: new Date().toISOString(),
                },
            };
        }
        catch (error) {
            console.error('Upload error:', error);
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.InternalServerErrorException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to upload prescription. Please try again.');
        }
    }
};
exports.PrescriptionController = PrescriptionController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('prescription', {
        storage: (0, multer_1.memoryStorage)(),
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter: (req, file, callback) => {
            const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
            if (allowedMimes.includes(file.mimetype)) {
                callback(null, true);
            }
            else {
                callback(new common_1.BadRequestException('Only JPG, PNG, WEBP, and PDF files are allowed'), false);
            }
        },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PrescriptionController.prototype, "uploadPrescription", null);
exports.PrescriptionController = PrescriptionController = __decorate([
    (0, common_1.Controller)('prescriptions')
], PrescriptionController);
//# sourceMappingURL=upload-prescription.js.map
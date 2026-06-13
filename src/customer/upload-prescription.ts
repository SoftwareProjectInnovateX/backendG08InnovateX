// prescription.controller.ts

import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { v2 as cloudinary } from 'cloudinary';

// ✅ Firebase Admin SDK
import * as admin from 'firebase-admin';

interface PrescriptionBody {
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  userId?: string;
}

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

// ✅ Configure Cloudinary once at module level
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Upload buffer to Cloudinary, returns secure URL
function uploadToCloudinary(file: MulterFile): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder:        'prescriptions',
        resource_type: 'auto', // handles images AND PDFs
      },
    (error, result) => {
  if (error) return reject(error);
  if (!result) return reject(new Error('Cloudinary upload returned no result'));
  resolve(result.secure_url);
},
    );
    stream.end(file.buffer);
  });
}

@Controller('prescriptions')
export class PrescriptionController {
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('prescription', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
      fileFilter: (req, file, callback) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
        if (allowedMimes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(new BadRequestException('Only JPG, PNG, WEBP, and PDF files are allowed'), false);
        }
      },
    }),
  )
  async uploadPrescription(
    @UploadedFile() file: MulterFile,
    @Body() body: PrescriptionBody,
  ) {
    // ✅ Validate file
    if (!file) {
      throw new BadRequestException('No prescription file provided');
    }

    // ✅ Validate required body fields
    const { customerName, customerPhone, customerAddress, userId } = body;
    if (!customerName || !customerPhone) {
      throw new BadRequestException('customerName and customerPhone are required');
    }

    // ✅ Validate env variables
    const requiredEnvVars = [
      'EMAIL_USER', 'EMAIL_PASS', 'PHARMACIST_EMAIL',
      'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET',
    ];
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        throw new InternalServerErrorException(`Missing environment variable: ${envVar}`);
      }
    }

    try {
      // ✅ Upload to Cloudinary — get back a public URL
      const imageUrl = await uploadToCloudinary(file);

      // ✅ Save to Firestore
      const db = admin.firestore();
      const docRef = await db.collection('prescriptions').add({
        fileName:        file.originalname,
        fileSize:        file.size,
        mimeType:        file.mimetype,
        imageUrl,                                          // ✅ clean Cloudinary URL
        status:          'Pending',
        customerName,
        customerPhone,
        customerAddress: customerAddress || '',
        userId:          userId || null,
        createdAt:       admin.firestore.FieldValue.serverTimestamp(),
      });

      // ✅ Send email notification with image link
      const transporter: Transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from:    `"MediCareX" <${process.env.EMAIL_USER}>`,
        to:      process.env.PHARMACIST_EMAIL,
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
            content:  file.buffer,
          },
        ],
      });

      return {
        success: true,
        message: 'Prescription uploaded and pharmacist notified',
        prescription: {
          id:              docRef.id,
          fileName:        file.originalname,
          fileSize:        file.size,
          mimeType:        file.mimetype,
          imageUrl,
          status:          'Pending',
          customerName,
          customerPhone,
          customerAddress: customerAddress || '',
          userId:          userId || null,
          createdAt:       new Date().toISOString(),
        },
      };

    } catch (error) {
      console.error('Upload error:', error);

      if (
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to upload prescription. Please try again.');
    }
  }
}
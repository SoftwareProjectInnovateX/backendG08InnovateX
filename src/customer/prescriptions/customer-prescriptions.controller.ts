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
import * as fs from 'fs';
import * as path from 'path';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { FirebaseService } from '../../shared/firebase/firebase.service.js';

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

@Controller('prescriptions')
export class CustomerPrescriptionsController {
  constructor(private readonly firebaseService: FirebaseService) {}

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
    if (!file) {
      throw new BadRequestException('No prescription file provided');
    }

    const { customerName, customerPhone, customerAddress, userId } = body;
    if (!customerName || !customerPhone) {
      throw new BadRequestException('customerName and customerPhone are required');
    }

    const requiredEnvVars = ['EMAIL_USER', 'EMAIL_PASS', 'PHARMACIST_EMAIL', 'APP_URL'];
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        throw new InternalServerErrorException(`Missing environment variable: ${envVar}`);
      }
    }

    try {
      // ✅ Corrected path: relative to process.cwd() and matching static serve config
      const uploadsDir = path.join(process.cwd(), 'uploads', 'prescriptions');

      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const sanitizedOriginalName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
      const uniqueName = `${Date.now()}-${sanitizedOriginalName}`;
      const filePath = path.join(uploadsDir, uniqueName);

      fs.writeFileSync(filePath, file.buffer);

      const db = this.firebaseService.getDb();
      const docRef = await db.collection('prescriptions').add({
        fileName: uniqueName,
        fileSize: file.size,
        mimeType: file.mimetype,
        imageUrl: `/uploads/prescriptions/${uniqueName}`,
        status: 'pending',
        customerName,
        customerPhone,
        customerAddress: customerAddress || '',
        userId: userId || null,
        createdAt: this.firebaseService.getTimestamp(),
      });

      const transporter: Transporter = nodemailer.createTransport({
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
          <p><b>File Name:</b> ${uniqueName}</p>
          <p><b>Size:</b> ${(file.size / 1024 / 1024).toFixed(2)} MB</p>
          <p><b>Upload Time:</b> ${new Date().toLocaleString()}</p>
          <p>
            <a href="${process.env.APP_URL}/uploads/prescriptions/${uniqueName}">
              View Prescription
            </a>
          </p>
        `,
        attachments: [
          {
            filename: uniqueName,
            content: file.buffer,
          },
        ],
      });

      return {
        success: true,
        message: 'Prescription uploaded and pharmacist notified',
        prescription: {
          id: docRef.id,
          fileName: uniqueName,
          imageUrl: `/uploads/prescriptions/${uniqueName}`,
          status: 'pending',
        },
      };
    } catch (error) {
      console.error('Upload error:', error);
      if (error instanceof BadRequestException || error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to upload prescription. Please try again.');
    }
  }
}

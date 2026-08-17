import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as admin from 'firebase-admin';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class PrescriptionsService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  private get db() {
    return admin.firestore();
  }

  // ── Upload file buffer to Cloudinary ──────────────────────────────────────
  private uploadToCloudinary(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'prescriptions',
          resource_type: 'auto', // handles both images and PDFs
        },
        (error: any, result) => {
          if (error)
            return reject(new Error(error.message || JSON.stringify(error)));
          if (!result)
            return reject(new Error('Cloudinary upload returned no result'));
          resolve(result.secure_url);
        },
      );
      uploadStream.end(file.buffer);
    });
  }

  async uploadPrescription(
    file: Express.Multer.File,
    customerName: string,
    customerPhone: string,
    customerAddress: string,
    userId?: string,
  ) {
    // Upload to Cloudinary — get back a public URL
    const imageUrl = await this.uploadToCloudinary(file);

    const docRef = await this.db.collection('prescriptions').add({
      customerName,
      customerPhone,
      customerAddress,
      userId: userId || null,
      imageUrl, // clean URL, not base64
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
    } catch (emailErr) {
      console.warn(
        'Failed to send pharmacist email notification:',
        emailErr.message,
      );
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

  async updatePrescription(id: string, updateData: any) {
    await this.db.collection('prescriptions').doc(id).update(updateData);
    return { success: true };
  }
}

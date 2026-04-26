import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as admin from 'firebase-admin';

@Injectable()
export class PrescriptionsService {
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

  async uploadPrescription(
    file: Express.Multer.File,
    customerName: string,
    customerPhone: string,
    customerAddress: string,
  ) {
    const imageUrl = `http://localhost:5000/uploads/${file.filename}`;

    const docRef = await this.db.collection('prescriptions').add({
      customerName,
      customerPhone,
      customerAddress,
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
            <a href="${imageUrl}"
              style="background:#16a34a;color:white;padding:10px 20px;
                     border-radius:6px;text-decoration:none;">
              View Prescription
            </a>
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

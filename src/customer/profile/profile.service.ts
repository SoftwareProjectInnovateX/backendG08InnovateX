import { Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../../shared/firebase/firebase.service';
import { FieldValue } from 'firebase-admin/firestore';

@Injectable()
export class ProfileService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async getProfile(uid: string) {
    const db   = this.firebaseService.getDb();
    const snap = await db.collection('users').doc(uid).get();

    if (!snap.exists) throw new NotFoundException('User not found');

    return {
      id: snap.id,
      ...snap.data(),
    };
  }

  async updateProfile(uid: string, body: any) {
    const db     = this.firebaseService.getDb();
    const docRef = db.collection('users').doc(uid);

    const updatePayload: any = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    // only update fields that are provided
    if (body.fullName  !== undefined) updatePayload.fullName  = body.fullName;
    if (body.phone     !== undefined) updatePayload.phone     = body.phone;
    if (body.address   !== undefined) updatePayload.address   = body.address;
    if (body.photoURL  !== undefined) updatePayload.photoURL  = body.photoURL;

    await docRef.update(updatePayload);

    return { success: true, uid };
  }
}
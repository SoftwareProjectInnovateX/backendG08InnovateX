import { Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../../shared/firebase/firebase.service.js';

@Injectable()
export class UsersService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async getAllUsers() {
    const db = this.firebaseService.getDb();
    const snapshot = await db
      .collection('users')
      .orderBy('createdAt', 'desc')
      .get();
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  async getUserById(id: string) {
    const db = this.firebaseService.getDb();
    const docSnap = await db.collection('users').doc(id).get();
    if (!docSnap.exists) throw new NotFoundException('User not found');
    return { id: docSnap.id, ...docSnap.data() };
  }

  async addLoyaltyPoints(id: string, points: number) {
    const db = this.firebaseService.getDb();
    const ref = db.collection('users').doc(id);
    const snap = await ref.get();
    if (!snap.exists) throw new NotFoundException('User not found');

    const current = (snap.data()?.loyaltyPoints || 0) + points;
    await ref.update({ loyaltyPoints: current });
    return { success: true, loyaltyPoints: current };
  }

  async updateStatus(id: string, status: string) {
    const db = this.firebaseService.getDb();
    const ref = db.collection('users').doc(id);
    const snap = await ref.get();
    if (!snap.exists) throw new NotFoundException('User not found');

    await ref.update({ status });
    return { success: true, status };
  }
}

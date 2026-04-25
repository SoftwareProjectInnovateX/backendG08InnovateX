import { Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../../shared/firebase/firebase.service.js';

@Injectable()
export class PharmacistInventoryService {
  private readonly collectionName = 'adminProducts';

  constructor(private readonly firebaseService: FirebaseService) {}

  async getInventory() {
    const db = this.firebaseService.getDb();
    const snapshot = await db.collection(this.collectionName).get();
    return snapshot.docs.map(doc => ({ firebaseId: doc.id, id: doc.id, ...doc.data() }));
  }

  async addInventoryItem(itemData: any) {
    const db = this.firebaseService.getDb();
    const docRef = await db.collection(this.collectionName).add(itemData);
    return { id: docRef.id, ...itemData };
  }

  async updateInventoryItem(id: string, updateData: any) {
    const db = this.firebaseService.getDb();
    const docRef = db.collection(this.collectionName).doc(id);
    await docRef.update(updateData);
    return { id, ...updateData };
  }

  async deleteInventoryItem(id: string) {
    const db = this.firebaseService.getDb();
    const docRef = db.collection(this.collectionName).doc(id);
    await docRef.delete();
    return { id };
  }
}

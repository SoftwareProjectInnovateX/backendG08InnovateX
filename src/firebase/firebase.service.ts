import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService {
  private db: admin.firestore.Firestore;

  private ensureInitialized() {
    if (!admin.apps.length) {
      const serviceAccount = require('../../serviceAccountKey.json');
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
    if (!this.db) {
      this.db = admin.firestore();
    }
  }

  getDb(): admin.firestore.Firestore {
    this.ensureInitialized();
    return this.db;
  }

  getTimestamp() {
    this.ensureInitialized();
    return admin.firestore.FieldValue.serverTimestamp();
  }
}
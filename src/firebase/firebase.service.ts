import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FirebaseService {
  private db: admin.firestore.Firestore;

  private ensureInitialized() {
    if (!admin.apps.length) {
      const keyPath = path.join(process.cwd(), 'serviceAccountKey.json');
      const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
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

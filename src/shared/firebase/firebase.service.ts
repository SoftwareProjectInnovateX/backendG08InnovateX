import * as dotenv from 'dotenv';
dotenv.config();

import { Injectable } from '@nestjs/common';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

@Injectable()
export class FirebaseService {
  private db!: Firestore;
  private authAdmin!: Auth;

  private ensureInitialized() {
    if (!getApps().length) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID!,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
          privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
        }),
      });
    }
    if (!this.db) this.db = getFirestore();
    if (!this.authAdmin) this.authAdmin = getAuth();
  }

  getDb(): Firestore {
    this.ensureInitialized();
    return this.db;
  }

  getAdmin(): Auth {
    this.ensureInitialized();
    return this.authAdmin;
  }
}
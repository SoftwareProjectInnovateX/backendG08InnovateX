import * as dotenv from 'dotenv';
dotenv.config();
import { Injectable } from '@nestjs/common';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

@Injectable()
export class FirebaseService {
  private db: Firestore;
  private authAdmin: Auth;

  constructor() {
    // Initialize in constructor so it's ready before any service uses it
    if (!getApps().length) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID!,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
          privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
        }),
      });
    }
    this.db = getFirestore();
    this.authAdmin = getAuth();
  }

  getDb(): Firestore {
    return this.db; // ✅ return the stored instance, not a fresh getFirestore() call
  }

  getAdmin(): Auth {
    return this.authAdmin;
  }
}
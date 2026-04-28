import * as dotenv from 'dotenv';
dotenv.config();
import { Injectable, OnModuleInit } from '@nestjs/common';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private db!: Firestore;
  private auth!: Auth;

  onModuleInit() {
    if (!getApps().length) {
      initializeApp({
        credential: cert({
          projectId:   process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    }
    this.db   = getFirestore();
    this.auth = getAuth(); // FIX: initialize auth so getAdmin() works
  }

  getDb(): Firestore {
    return this.db;
  }

  // FIX: Added missing getAdmin() — called by FirebaseAuthGuard, app.controller,
  // and account-requests.service but was never defined, causing all 403s.
  getAdmin(): Auth {
    return this.auth;
  }
}
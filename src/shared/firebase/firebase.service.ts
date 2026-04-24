import * as dotenv from 'dotenv';
dotenv.config();

import { Injectable, OnModuleInit } from '@nestjs/common';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private db!: Firestore;
  private authAdmin!: Auth;

  onModuleInit() {
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
    if (!getApps().length) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID!,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
          privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
        }),
      });
    }
    return getFirestore();
  }

  getAdmin(): Auth {
    if (!this.authAdmin) {
      this.authAdmin = getAuth();
    }
    return this.authAdmin;
  }

  getTimestamp() {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const admin = require('firebase-admin');
    return admin.firestore.FieldValue.serverTimestamp();
  }
}

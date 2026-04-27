// src/auth/firebase-auth.guard.ts

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { DecodedIdToken } from 'firebase-admin/auth';
import { FirebaseService } from '../shared/firebase/firebase.service.js';

interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email: string | undefined;
    role: string | undefined;
  };
}

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(private firebaseService: FirebaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.split('Bearer ')[1];

    try {
      // FIX: getAdmin() now exists on FirebaseService — previously this threw
      // "getAdmin is not a function" which was caught and returned 403 for every request.
      const firebaseAuth = this.firebaseService.getAdmin();
      const decodedToken: DecodedIdToken = await firebaseAuth.verifyIdToken(token);
      const uid = decodedToken.uid;
      const db = this.firebaseService.getDb();

      // Check custom claim first (set via setCustomUserClaims)
      let role = (decodedToken as any).role as string | undefined;

      if (!role) {
        // Check 'admins' collection FIRST before any other collection
        const adminDoc = await db.collection('admins').doc(uid).get();
        if (adminDoc.exists) {
          role = adminDoc.data()?.role || 'admin';
          console.log(`[FirebaseAuthGuard] Found in 'admins' collection. Role: ${role}`);
        } else {
          // Try 'suppliers'
          const supplierDoc = await db.collection('suppliers').doc(uid).get();
          if (supplierDoc.exists) {
            role = 'supplier';
            console.log(`[FirebaseAuthGuard] Found in 'suppliers' collection.`);
          } else {
            // Try 'pharmacists'
            const pharmacistDoc = await db.collection('pharmacists').doc(uid).get();
            if (pharmacistDoc.exists) {
              role = 'pharmacist';
              console.log(`[FirebaseAuthGuard] Found in 'pharmacists' collection.`);
            } else {
              // Try 'users' collection (customers)
              const userDoc = await db.collection('users').doc(uid).get();
              if (userDoc.exists) {
                role = userDoc.data()?.role || 'customer';
                console.log(`[FirebaseAuthGuard] Found in 'users' collection. Role: ${role}`);
              }
            }
          }
        }
      }

      if (!role) {
        console.warn(`[FirebaseAuthGuard] No role found for UID: ${uid}`);
      }

      request.user = {
        uid,
        email: decodedToken.email,
        role,
      };

      return true;
    } catch (error) {
      console.error('[FirebaseAuthGuard] Error:', error.message || error);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
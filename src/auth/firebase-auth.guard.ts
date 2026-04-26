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
// Extend Express Request so TypeScript knows request.user exists
interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email: string | undefined;
  };
}

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(private firebaseService: FirebaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    // Get the token from the Authorization header
    // Header format: "Bearer eyJhbGci..."
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.split('Bearer ')[1];

    try {
      const firebaseAuth = this.firebaseService.getAdmin();
      const decodedToken: DecodedIdToken =
        await firebaseAuth.verifyIdToken(token);

      request.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
      };

      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}

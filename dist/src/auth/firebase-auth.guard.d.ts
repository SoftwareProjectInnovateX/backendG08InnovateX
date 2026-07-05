import { CanActivate, ExecutionContext } from '@nestjs/common';
import { FirebaseService } from '../shared/firebase/firebase.service.js';
export declare class FirebaseAuthGuard implements CanActivate {
    private firebaseService;
    constructor(firebaseService: FirebaseService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}

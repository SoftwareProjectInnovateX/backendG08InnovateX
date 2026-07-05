import { OnModuleInit } from '@nestjs/common';
import { Firestore } from 'firebase-admin/firestore';
import { Auth } from 'firebase-admin/auth';
export declare class FirebaseService implements OnModuleInit {
    private db;
    private auth;
    onModuleInit(): void;
    getDb(): Firestore;
    getAdmin(): Auth;
}

import * as admin from 'firebase-admin';
export declare class FirebaseService {
    private db;
    private ensureInitialized;
    getDb(): admin.firestore.Firestore;
    getTimestamp(): admin.firestore.FieldValue;
}

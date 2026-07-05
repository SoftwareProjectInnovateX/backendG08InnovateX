"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const admin = __importStar(require("firebase-admin"));
const serviceAccount = require('../src/serviceAccountKey.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'supplier-management-70b81.firebasestorage.app',
});
async function fixImageUrls() {
    const db = admin.firestore();
    const bucket = admin.storage().bucket();
    const snap = await db.collection('prescriptions').get();
    console.log(`Found ${snap.docs.length} prescriptions`);
    for (const docSnap of snap.docs) {
        const data = docSnap.data();
        const oldUrl = data.imageUrl || '';
        if (!oldUrl.includes('storage.googleapis.com')) {
            console.log(`Skipping ${docSnap.id}`);
            continue;
        }
        try {
            const bucketName = 'supplier-management-70b81.firebasestorage.app';
            const filePath = oldUrl.split(`${bucketName}/`)[1];
            if (!filePath) {
                console.log(`Could not extract path from: ${oldUrl}`);
                continue;
            }
            const file = bucket.file(filePath);
            const [signedUrl] = await file.getSignedUrl({
                action: 'read',
                expires: '03-01-2030',
            });
            await db.collection('prescriptions').doc(docSnap.id).update({
                imageUrl: signedUrl,
            });
            console.log(`✅ Fixed: ${docSnap.id}`);
        }
        catch (err) {
            console.error(`❌ Failed ${docSnap.id}:`, err.message);
        }
    }
    console.log('Done!');
    process.exit(0);
}
fixImageUrls();
//# sourceMappingURL=fix-image-urls.js.map
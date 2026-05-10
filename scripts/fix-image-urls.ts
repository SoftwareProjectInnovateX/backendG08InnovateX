import * as admin from 'firebase-admin';

// ✅ Use your existing service account key path
const serviceAccount = require('../src/serviceAccountKey.json'); 
// OR try these paths if above doesn't work:
// require('./serviceAccountKey.json')
// require('../serviceAccountKey.json')

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
    const oldUrl: string = data.imageUrl || '';

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
    } catch (err) {
      console.error(`❌ Failed ${docSnap.id}:`, (err as Error).message);
    }
  }

  console.log('Done!');
  process.exit(0);
}

fixImageUrls();
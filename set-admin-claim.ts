import * as dotenv from 'dotenv';
dotenv.config();

import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

initializeApp({
  credential: cert({
    projectId:   process.env.FIREBASE_PROJECT_ID!,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
    privateKey:  process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  }),
});

async function setAdminClaim() {
  await getAuth().setCustomUserClaims('r0xXWdAeqGagF3MSCGc9pXcghu73', { role: 'admin' });
  console.log(' Admin claim set successfully');
  process.exit(0);
}

setAdminClaim().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
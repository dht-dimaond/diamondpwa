// /lib/firebase-admin.ts
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
let app;
if (!getApps().length) {
  try {
    // Method 1: Using service account key file
    app = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
    
    // Method 2: Alternative - using service account key file path
    // app = initializeApp({
    //   credential: cert(require('path/to/serviceAccountKey.json')),
    //   projectId: process.env.FIREBASE_PROJECT_ID,
    // });
    
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
    throw new Error('Failed to initialize Firebase Admin');
  }
} else {
  app = getApps()[0];
}

export const adminDb = getFirestore(app);

// Test connection function
export async function testFirebaseConnection() {
  try {
    // Simple test query
    const testRef = adminDb.collection('_test').limit(1);
    await testRef.get();
    console.log('✅ Firebase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Firebase connection failed:', error);
    return false;
  }
}
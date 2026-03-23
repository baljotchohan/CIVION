import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    // Replace literal '\n' with actual newlines for the private key
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (projectId && clientEmail && privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      console.log('Firebase Admin initialized successfully.');
    } else {
      console.warn('Firebase Admin credentials missing. Initializing dummy app for build step.');
      admin.initializeApp({ projectId: 'demo-project-build' });
    }
  } catch (error) {
    console.error('Firebase Admin initialization error', error);
  }
}

export const db = admin.firestore();

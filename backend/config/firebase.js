const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      })
    });

    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Firebase initialization error:', error);
    throw error;
  }
};

const getFirestore = () => {
  return admin.firestore();
};

module.exports = {
  initializeFirebase,
  getFirestore
};

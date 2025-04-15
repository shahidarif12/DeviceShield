import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'development-placeholder',
  authDomain: import.meta.env.VITE_FIREBASE_PROJECT_ID 
    ? `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com` 
    : 'development-placeholder.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'development-placeholder',
  storageBucket: import.meta.env.VITE_FIREBASE_PROJECT_ID 
    ? `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`
    : 'development-placeholder.appspot.com',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'development-placeholder',
};

// Check if we have the required Firebase configuration
const isFirebaseConfigured = () => {
  return (
    import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_PROJECT_ID &&
    import.meta.env.VITE_FIREBASE_APP_ID
  );
};

// Initialize Firebase app only if properly configured
let firebaseApp = null;
let auth = null;

try {
  if (isFirebaseConfigured()) {
    firebaseApp = initializeApp(firebaseConfig);
    auth = getAuth(firebaseApp);
    console.log('Firebase initialized successfully');
  } else {
    console.warn(
      'Firebase is not configured properly. Authentication will not work.',
      'Please set the VITE_FIREBASE_* environment variables.'
    );
  }
} catch (error) {
  console.error('Error initializing Firebase:', error);
}

export { firebaseApp, auth, isFirebaseConfigured };
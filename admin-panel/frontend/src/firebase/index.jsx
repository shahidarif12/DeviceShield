import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Get environment variables
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummy123456789";
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project-id";
const appId = import.meta.env.VITE_FIREBASE_APP_ID || "1:123456:web:abcdef";

// Firebase configuration - using dummy values for development
const firebaseConfig = {
  apiKey,
  authDomain: `${projectId}.firebaseapp.com`,
  projectId,
  storageBucket: `${projectId}.appspot.com`,
  messagingSenderId: "123456789012",
  appId,
};

console.log("Initializing Firebase with config:", 
  JSON.stringify({
    apiKey: apiKey.substring(0, 4) + "...",
    projectId,
    appId: appId.substring(0, 5) + "..."
  })
);

// Initialize Firebase - wrapped in try/catch for graceful error handling
let app = null;
let auth = null;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Error initializing Firebase:", error);
  // Create fallback auth object to prevent app from crashing
  auth = {
    currentUser: null,
    onAuthStateChanged: (callback) => callback(null),
    signOut: () => Promise.resolve(),
  };
}

// Export auth and app
export { auth, app };
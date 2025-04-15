import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from './index';

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    if (!isFirebaseConfigured()) {
      console.warn('Firebase not configured, using development login');
      // In development, return a mock user
      return {
        user: {
          uid: 'dev-user-123',
          email: 'dev@example.com',
          displayName: 'Development User',
        },
        developmentMode: true
      };
    }
    
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return { user: result.user, developmentMode: false };
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

// Sign in with email/password
export const signInWithEmail = async (email, password) => {
  try {
    if (!isFirebaseConfigured()) {
      console.warn('Firebase not configured, using development login');
      
      // In development mode, accept any email with password "admin123"
      if (password === 'admin123') {
        return {
          user: {
            uid: 'dev-user-' + Math.random().toString(36).substring(2, 8),
            email: email,
            displayName: email.split('@')[0],
          },
          developmentMode: true
        };
      } else {
        throw new Error('Invalid credentials');
      }
    }
    
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { user: result.user, developmentMode: false };
  } catch (error) {
    console.error('Error signing in with email/password:', error);
    throw error;
  }
};

// Sign out the current user
export const signOut = async () => {
  try {
    if (!isFirebaseConfigured()) {
      console.warn('Firebase not configured, using mock sign out');
      return true;
    }
    
    await firebaseSignOut(auth);
    return true;
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Get the current user
export const getCurrentUser = () => {
  return auth?.currentUser;
};

// Listen for auth state changes
export const onAuthStateChanged = (callback) => {
  if (!isFirebaseConfigured()) {
    console.warn('Firebase not configured, auth state changes will not be detected');
    return () => {}; // Return dummy unsubscribe function
  }
  
  return auth.onAuthStateChanged(callback);
};
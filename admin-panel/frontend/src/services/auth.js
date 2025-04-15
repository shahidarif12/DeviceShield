import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { signInWithGoogle, logOut } from '../firebase/auth';
import { login as apiLogin } from './api';

// Check if user is authenticated
export const isAuthenticated = () => {
  // For development, always return true if we're in a non-production environment
  if (import.meta.env.DEV && !import.meta.env.VITE_REQUIRE_AUTH) {
    return true;
  }
  return auth && !!auth.currentUser;
};

// Check authentication status (returns a promise)
export const checkAuthStatus = () => {
  // For development without Firebase, allow skipping auth
  if (import.meta.env.DEV && !import.meta.env.VITE_REQUIRE_AUTH) {
    console.log("Development mode: Auto-authenticating");
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    if (!auth || typeof auth.onAuthStateChanged !== 'function') {
      console.warn("Auth not properly initialized, defaulting to unauthenticated");
      resolve(false);
      return;
    }
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(!!user);
    });
  });
};

// Login with Google and get API token
export const login = async () => {
  try {
    // Sign in with Google
    const result = await signInWithGoogle();
    
    if (result.error) {
      throw new Error(result.error);
    }
    
    const { user, token: firebaseToken } = result;
    
    if (!user) {
      throw new Error('Google authentication failed');
    }
    
    try {
      // Get JWT token from our backend
      const apiResponse = await apiLogin(firebaseToken);
      
      // Store the JWT token in localStorage
      localStorage.setItem('auth_token', apiResponse.access_token);
    } catch (apiError) {
      console.warn('Backend authentication failed, using development mode:', apiError);
      // In development, we can continue without a valid backend token
      if (import.meta.env.DEV) {
        localStorage.setItem('auth_token', 'dev-token-123456789');
      } else {
        throw apiError;
      }
    }
    
    return {
      success: true,
      user: user,
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      success: false,
      error: error.message || 'Authentication failed',
    };
  }
};

// Logout
export const logout = async () => {
  try {
    await logOut();
    localStorage.removeItem('auth_token');
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    // Still remove the token even if Firebase logout fails
    localStorage.removeItem('auth_token');
    return {
      success: true, // Consider logout successful anyway
      warning: error.message,
    };
  }
};
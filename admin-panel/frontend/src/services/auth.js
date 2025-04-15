import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { signInWithGoogle, logOut } from '../firebase/auth';
import { login as apiLogin } from './api';

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!auth.currentUser;
};

// Check authentication status (returns a promise)
export const checkAuthStatus = () => {
  return new Promise((resolve) => {
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
    const { user, token: firebaseToken } = await signInWithGoogle();
    
    if (!user) {
      throw new Error('Google authentication failed');
    }
    
    // Get JWT token from our backend
    const apiResponse = await apiLogin(firebaseToken);
    
    // Store the JWT token in localStorage
    localStorage.setItem('auth_token', apiResponse.access_token);
    
    return {
      success: true,
      user: user,
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      success: false,
      error: error.message,
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
    return {
      success: false,
      error: error.message,
    };
  }
};
import { 
  signInWithPopup, 
  GoogleAuthProvider,
  signOut,
  getIdToken
} from "firebase/auth";
import { auth } from "./index";

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    // Create a new Google Auth Provider instance
    const googleProvider = new GoogleAuthProvider();
    
    // Verify auth object
    if (!auth || typeof auth.signInWithPopup !== 'function') {
      console.warn("Auth not properly initialized or in development mode");
      return { 
        user: { 
          displayName: "Test User", 
          email: "test@example.com",
          uid: "test-user-id" 
        }, 
        token: "test-token-123456789" 
      };
    }
    
    const result = await signInWithPopup(auth, googleProvider);
    // Get the token
    const token = await getIdToken(result.user);
    return { user: result.user, token };
  } catch (error) {
    console.error("Error signing in with Google: ", error);
    // Return a graceful error for development
    return { error: error.message || "Authentication failed" };
  }
};

// Sign out
export const logOut = async () => {
  try {
    if (auth && typeof auth.signOut === 'function') {
      await signOut(auth);
      console.log("User signed out");
    } else {
      console.log("Auth not initialized. Mock sign out.");
    }
  } catch (error) {
    console.error("Error signing out: ", error);
  }
};

// Get current user
export const getCurrentUser = () => {
  return auth && auth.currentUser ? auth.currentUser : null;
};

// Get token
export const getToken = async () => {
  if (!auth || !auth.currentUser) return null;
  
  try {
    return await getIdToken(auth.currentUser);
  } catch (error) {
    console.error("Error getting token:", error);
    return null;
  }
};
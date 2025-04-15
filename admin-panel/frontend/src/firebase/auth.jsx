import { 
  signInWithPopup, 
  GoogleAuthProvider,
  signOut,
  getIdToken
} from "firebase/auth";
import { auth } from "./index";

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    // Get the token
    const token = await getIdToken(result.user);
    return { user: result.user, token };
  } catch (error) {
    console.error("Error signing in with Google: ", error);
    throw error;
  }
};

// Sign out
export const logOut = async () => {
  try {
    await signOut(auth);
    console.log("User signed out");
  } catch (error) {
    console.error("Error signing out: ", error);
    throw error;
  }
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Get token
export const getToken = async () => {
  const user = auth.currentUser;
  if (user) {
    return await getIdToken(user);
  }
  return null;
};
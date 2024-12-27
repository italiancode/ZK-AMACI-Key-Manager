import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../config/firebase";

export const getAuthToken = async () => {
  const user = await signInWithPopup(auth, new GoogleAuthProvider());
  return user.user?.getIdToken();
}; 
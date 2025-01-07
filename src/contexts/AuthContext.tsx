import React, { createContext, useContext, useState, useEffect } from "react";
import {
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
  signInWithCredential,
  AuthCredential,
} from "firebase/auth";
import { auth, db } from "../config/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import PasswordManager from "../services/passwordManager";

interface AuthContextType {
  currentUser: User | null;
  signInWithGoogle: (token?: any) => Promise<void>;
  signInWithGithub: () => Promise<void>;
  logout: () => Promise<void>;
  storeEncryptedPassword: (encryptedPassword: string) => Promise<void>;
  getEncryptedPassword: () => Promise<string | null>;
  isLoggingOut: boolean;
  isLoggingIn: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const passwordManager = new PasswordManager();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const updateUserInFirestore = async (user: User) => {
    await setDoc(
      doc(db, "users", user.uid),
      {
        email: user.email,
        name: user.displayName,
        photoURL: user.photoURL,
        lastLogin: new Date().toISOString(),
      },
      { merge: true }
    );
  };

  const signInWithGoogle = async (token?: any): Promise<void> => {
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      const result = token
        ? await signInWithCredential(
            auth,
            GoogleAuthProvider.credential(
              null,
              token._tokenResponse.oauthAccessToken
            ) as AuthCredential
          )
        : await signInWithPopup(auth, new GoogleAuthProvider());

      await updateUserInFirestore(result.user);
    } catch (error) {
      console.error("Auth error:", error);
      setAuthError("Sign in was unavailable. Please try again later.");
      throw error;
    } finally {
      setIsLoggingIn(false);
      setAuthError(null);
    }
  };

  const signInWithGithub = async () => {
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, new GithubAuthProvider());
      await updateUserInFirestore(result.user);
    } catch (error) {
      console.error("GitHub sign-in error:", error);
      setAuthError("GitHub sign-in failed. Please try again later.");
      throw error;
    } finally {
      setIsLoggingIn(false);
    }
  };

  const logout = async () => {
    setIsLoggingOut(true);
    try {
      await passwordManager.clearAllData();
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    } finally {
      setIsLoggingOut(false);
    }
  };

  const storeEncryptedPassword = async (password: string) => {
    if (!currentUser) throw new Error("No user logged in");
    try {
      await passwordManager.setPassword(password);
    } catch (error) {
      console.error("Error storing encrypted password:", error);
      throw error;
    }
  };

  const getEncryptedPassword = async () => {
    if (!currentUser) return null;
    const docRef = doc(db, "users", currentUser.uid);
    const docSnap = await getDoc(docRef);
    return docSnap.data()?.encryptedPassword || null;
  };

  const value = {
    currentUser,
    signInWithGoogle,
    signInWithGithub,
    logout,
    storeEncryptedPassword,
    getEncryptedPassword,
    isLoggingOut,
    isLoggingIn,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
      {(isLoggingIn || isLoggingOut) && (
        <div className="fixed inset-0 bg-bg-primary/50 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="bg-bg-secondary p-6 rounded-xl shadow-xl max-w-md w-full mx-4 border border-text-secondary/10">
            <h3 className="text-xl font-semibold text-accent mb-2">
              {isLoggingIn ? "Signing in..." : "Logging out..."}
            </h3>
            {authError ? (
              <p className="text-text-danger">
                {authError}
              </p>
            ) : (
              <p className="text-text-primary">
                {isLoggingIn 
                  ? "Sign in in progress. Please wait..."
                  : "Clearing all stored data and signing out. Please wait..."
                }
              </p>
            )}
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

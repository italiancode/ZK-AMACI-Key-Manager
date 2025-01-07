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
  const passwordManager = new PasswordManager();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async (token?: any): Promise<void> => {
    if (token && typeof token === "object") {
      try {
        console.log("Token data:", token);
        const credential = GoogleAuthProvider.credential(
          null,
          token._tokenResponse.oauthAccessToken
        ) as AuthCredential;

        console.log(credential);
        const result = await signInWithCredential(auth, credential);

        await setDoc(
          doc(db, "users", result.user.uid),
          {
            email: result.user.email,
            name: result.user.displayName,
            photoURL: result.user.photoURL,
            lastLogin: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (error) {
        console.error("Auth error:", error);
        throw error;
      }
    } else {
      try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);

        await setDoc(
          doc(db, "users", result.user.uid),
          {
            email: result.user.email,
            name: result.user.displayName,
            photoURL: result.user.photoURL,
            lastLogin: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (error) {
        console.error("Web auth error:", error);
        throw error;
      }
    }
  };

  const signInWithGithub = async () => {
    const provider = new GithubAuthProvider();
    const result = await signInWithPopup(auth, provider);
    await setDoc(
      doc(db, "users", result.user.uid),
      {
        email: result.user.email,
        name: result.user.displayName,
        photoURL: result.user.photoURL,
        createdAt: new Date().toISOString(),
      },
      { merge: true }
    );
  };

  const logout = async () => {
    setIsLoggingOut(true);
    try {
      await passwordManager.clearAllData();
      await signOut(auth);

      await new Promise((resolve) => setTimeout(resolve, 500));
      setIsLoggingOut(false);
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
      throw error;
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
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
      {isLoggingOut && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
          <div className="bg-bg-primary p-6 rounded-xl shadow-xl max-w-md w-full mx-4 border border-text-secondary/10">
            <h3 className="text-xl font-semibold text-accent mb-2">
              Logging out...
            </h3>
            <p className="text-text-primary">
              Clearing all stored data and signing out. Please wait...
            </p>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

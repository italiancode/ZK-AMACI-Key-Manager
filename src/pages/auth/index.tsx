import React, { useEffect } from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../../config/firebase";
import { EXTENSION_ID } from "../../config/constants";

const AuthPage: React.FC = () => {
  useEffect(() => {
    const handleAuth = async () => {
      try {
        // Perform Google sign in
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);

        const token = result;

        // Send token back to extension
        chrome.runtime.sendMessage(EXTENSION_ID, {
          type: "AUTH_SUCCESS",
          token: token,
        });

        // Close the window after sending token
        window.close();
      } catch (error) {
        console.error("Auth error:", error);
        chrome.runtime.sendMessage(EXTENSION_ID, {
          type: "AUTH_ERROR",
          error: (error as Error).message,
        });
      }
    };

    handleAuth();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl mb-4">Authenticating...</h1>
        <p>Please wait while we complete the sign-in process.</p>
      </div>
    </div>
  );
};

export default AuthPage;

import React from "react";
import {
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
} from "firebase/auth";
import { auth } from "../../config/firebase";
import { EXTENSION_ID } from "../../config/constants";
import { FcGoogle } from "react-icons/fc";
import { FiGithub } from "react-icons/fi";

const AuthPage: React.FC = () => {
  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      const token = result;

      chrome.runtime.sendMessage(EXTENSION_ID, {
        type: "AUTH_SUCCESS",
        token: token,
      });

      window.close();
    } catch (error) {
      console.error("Auth error:", error);
      chrome.runtime.sendMessage(EXTENSION_ID, {
        type: "AUTH_ERROR",
        error: (error as Error).message,
      });
    }
  };

  const handleGithubSignIn = async () => {
    try {
      const provider = new GithubAuthProvider();
      const result = await signInWithPopup(auth, provider);

      chrome.runtime.sendMessage(EXTENSION_ID, {
        type: "AUTH_SUCCESS",
        token: result,
      });

      window.close();
    } catch (error) {
      console.error("Auth error:", error);
      chrome.runtime.sendMessage(EXTENSION_ID, {
        type: "AUTH_ERROR",
        error: (error as Error).message,
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-bg-primary">
      <div className="w-full max-w-md p-8 space-y-6 bg-bg-secondary rounded-lg shadow-xl">
        <h1 className="text-2xl font-bold text-center text-text-primary mb-8">
          Sign in to ZK-AMACI
        </h1>

        <div className="space-y-4">
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 text-text-primary bg-bg-primary rounded-lg hover:bg-bg-primary/90 transition-colors border border-text-secondary/10"
          >
            <FcGoogle className="w-5 h-5" />
            Continue with Google
          </button>

          <button
            onClick={handleGithubSignIn}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 text-text-primary bg-bg-primary rounded-lg hover:bg-bg-primary/90 transition-colors border border-text-secondary/10"
          >
            <FiGithub className="w-5 h-5" />
            Continue with GitHub
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

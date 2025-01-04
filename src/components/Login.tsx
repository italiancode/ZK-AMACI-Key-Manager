import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { isExtension } from "../utils/environment";
import { handleExternalAuth } from "../utils/auth";
import { FcGoogle } from "react-icons/fc";
import { FiGithub } from "react-icons/fi";

const Login: React.FC = () => {
  const [error, setError] = useState("");
  const { signInWithGoogle } = useAuth();

  const handleAuth = async () => {
    try {
      setError("");
      if (isExtension()) {
        const token = await handleExternalAuth();
        await signInWithGoogle(token as string);
      } else {
        await signInWithGoogle();
      }
    } catch (err) {
      console.error(err);
      setError("Failed to sign in");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-bg-primary to-bg-secondary">
      <div className="w-full max-w-md p-8 space-y-8 bg-bg-secondary/95 backdrop-blur-sm rounded-xl shadow-2xl m-4">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-accent">
            Sign in to ZK-AMACI
          </h1>
          <p className="text-text-secondary text-sm">
            Secure key management for your privacy
          </p>
        </div>

        {error && (
          <div className="p-4 bg-danger/10 border border-danger/20 rounded-lg text-danger text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {isExtension() ? (
            <button
              onClick={handleAuth}
              className="w-full py-4 px-6 rounded-lg bg-accent text-bg-primary font-semibold hover:bg-accent/90 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            >
              Sign In
            </button>
          ) : (
            <>
              <button
                onClick={handleAuth}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white text-gray-800 rounded-lg hover:bg-gray-50 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg font-semibold"
              >
                <FcGoogle className="w-6 h-6" />
                Continue with Google
              </button>

              <button
                onClick={handleAuth}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#24292F] text-white rounded-lg hover:bg-[#24292F]/90 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg font-semibold"
              >
                <FiGithub className="w-6 h-6" />
                Continue with GitHub
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;

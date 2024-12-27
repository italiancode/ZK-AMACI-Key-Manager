import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import { isExtension } from '../utils/environment';
import { handleExternalAuth } from '../utils/auth';

const Login: React.FC = () => {
  const [error, setError] = useState('');
  const { signInWithGoogle, signInWithGithub } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      if (isExtension()) {
        // Handle extension flow with external window
        const token = await handleExternalAuth();
        // Use the token to authenticate
        await signInWithGoogle(token as string);
      } else {
        // Regular web app flow
        await signInWithGoogle();
      }
    } catch (err) {
      console.error(err);
      setError('Failed to sign in with Google');
    }
  };

  const handleGithubSignIn = async () => {
    try {
      setError('');
      await signInWithGithub();
    } catch (err) {
      console.error(err);
      setError('Failed to sign in with GitHub');
    }
  };

  return (
    <div className="bg-bg-secondary rounded-lg p-6 shadow-lg max-w-md mx-auto mt-10">
      <h2 className="text-xl font-semibold mb-6 text-accent border-b border-accent pb-2">
        Sign In to ZK-AMACI
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-danger/10 border border-danger rounded text-danger text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <button
          onClick={handleGoogleSignIn}
          className="w-full py-3 px-4 rounded bg-white text-gray-800 font-medium hover:bg-gray-50 transition-colors flex items-center justify-center shadow-md"
        >
          <FcGoogle className="w-5 h-5 mr-3" />
          Continue with Google
        </button>

        <button
          onClick={handleGithubSignIn}
          className="w-full py-3 px-4 rounded bg-[#24292F] text-white font-medium hover:bg-[#24292F]/90 transition-colors flex items-center justify-center shadow-md"
        >
          <FaGithub className="w-5 h-5 mr-3" />
          Continue with GitHub
        </button>

        <p className="text-xs text-text-secondary text-center mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default Login; 
import React, { useState } from 'react';
import { FiCheck, FiX } from 'react-icons/fi';

interface SetPasswordProps {
  password: string;
  onPasswordChange: (password: string) => void;
  onSetPassword: () => void;
}

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const passwordRequirements: PasswordRequirement[] = [
  {
    label: "At least 8 characters long",
    test: (password) => password.length >= 8,
  },
  {
    label: "Contains uppercase letter",
    test: (password) => /[A-Z]/.test(password),
  },
  {
    label: "Contains lowercase letter",
    test: (password) => /[a-z]/.test(password),
  },
  {
    label: "Contains number",
    test: (password) => /[0-9]/.test(password),
  },
  {
    label: "Contains special character",
    test: (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
  },
];

const recommendedRequirements: PasswordRequirement[] = [
  {
    label: "Recommended: 12 or more characters",
    test: (password) => password.length >= 12,
  },
  {
    label: "Recommended: No consecutive repeated characters",
    test: (password) => !/(.)\1{2,}/.test(password),
  }
];

const SetPassword: React.FC<SetPasswordProps> = ({
  password,
  onPasswordChange,
  onSetPassword,
}) => {
  const [showRequirements, setShowRequirements] = useState(false);

  const requiredPasswordStrength = passwordRequirements.filter(req => 
    req.test(password)
  ).length;

  const recommendedPasswordStrength = recommendedRequirements.filter(req => 
    req.test(password)
  ).length;

  const isPasswordValid = requiredPasswordStrength === passwordRequirements.length;

  const getStrengthColor = () => {
    const totalRequirements = passwordRequirements.length + recommendedRequirements.length;
    const totalStrength = requiredPasswordStrength + recommendedPasswordStrength;
    const percentage = (totalStrength / totalRequirements) * 100;
    
    if (percentage < 33) return 'bg-danger';
    if (percentage < 66) return 'bg-warning';
    if (percentage < 100) return 'bg-accent/70';
    return 'bg-success';
  };

  return (
    <section className="bg-bg-secondary rounded-lg p-6 shadow-lg max-w-md mx-auto mt-10">
      <h2 className="text-xl font-semibold mb-4 text-accent border-b border-accent pb-2">
        Set Encryption Password
      </h2>
      <div className="space-y-4">
        <div className="relative">
          <input
            type="password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            onFocus={() => setShowRequirements(true)}
            placeholder="Enter strong encryption password"
            className="w-full p-3 rounded bg-bg-primary border border-text-secondary/20 text-text-primary focus:border-accent focus:outline-none"
          />
          <div className="mt-2 w-full h-1 bg-bg-primary rounded overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${getStrengthColor()}`}
              style={{ 
                width: `${((requiredPasswordStrength + recommendedPasswordStrength) / 
                (passwordRequirements.length + recommendedRequirements.length)) * 100}%` 
              }}
            />
          </div>
        </div>

        {showRequirements && (
          <div className="bg-bg-primary rounded p-4 border border-text-secondary/10">
            <h3 className="text-sm font-medium text-text-secondary mb-2">
              Required:
            </h3>
            <ul className="space-y-2 mb-4">
              {passwordRequirements.map((req, index) => (
                <li 
                  key={index}
                  className="flex items-center text-sm"
                >
                  {req.test(password) ? (
                    <FiCheck className="h-4 w-4 text-success mr-2" />
                  ) : (
                    <FiX className="h-4 w-4 text-danger mr-2" />
                  )}
                  <span className={req.test(password) ? 'text-success' : 'text-danger'}>
                    {req.label}
                  </span>
                </li>
              ))}
            </ul>

            <h3 className="text-sm font-medium text-text-secondary mb-2">
              Recommended:
            </h3>
            <ul className="space-y-2">
              {recommendedRequirements.map((req, index) => (
                <li 
                  key={index}
                  className="flex items-center text-sm"
                >
                  {req.test(password) ? (
                    <FiCheck className="h-4 w-4 text-success mr-2" />
                  ) : (
                    <FiX className="h-4 w-4 text-text-secondary mr-2" />
                  )}
                  <span className={req.test(password) ? 'text-success' : 'text-text-secondary'}>
                    {req.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={onSetPassword}
          disabled={!isPasswordValid}
          className={`w-full py-3 px-4 rounded font-medium transition-colors
            ${isPasswordValid 
              ? 'bg-accent text-bg-primary hover:bg-accent/90' 
              : 'bg-accent/50 text-bg-primary/50 cursor-not-allowed'
            }`}
        >
          Set Password
        </button>

        <p className="text-xs text-text-secondary text-center">
          This password will be used to encrypt your private keys. 
          Make sure to remember it as it cannot be recovered.
        </p>
      </div>
    </section>
  );
};

export default SetPassword; 
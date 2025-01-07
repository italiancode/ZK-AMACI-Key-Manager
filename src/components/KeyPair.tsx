import React, { useState } from "react";
import {
  FiEye,
  FiEyeOff,
  FiTrash2,
  FiAlertTriangle,
  FiCheck,
  FiCopy,
  FiInfo,
  FiEdit2,
} from "react-icons/fi";

interface KeyPairProps {
  publicKey: string;
  privateKey: string;
  status?: string;
  name?: string;
  showPrivateKey: boolean;
  copiedKey: string | null;
  onTogglePrivateKey: (publicKey: string) => void;
  onCopyToClipboard: (text: string, keyType: "public" | "private") => void;
  onDiscard?: (publicKey: string) => void;
  onDelete?: (publicKey: string) => void;
  onUpdateName?: (publicKey: string, name: string) => void;
  isNewlyGenerated?: boolean;
  createdAt?: string;
}

const KeyPair: React.FC<KeyPairProps> = ({
  publicKey,
  privateKey,
  status,
  name,
  showPrivateKey,
  copiedKey,
  onTogglePrivateKey,
  onCopyToClipboard,
  onDiscard,
  onDelete,
  onUpdateName,
  isNewlyGenerated,
  createdAt,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(name || "");

  const handleNameUpdate = () => {
    if (onUpdateName) {
      onUpdateName(publicKey, tempName);
    }
    setIsEditing(false);
  };

  return (
    <div
      className={`mt-6 ${
        isNewlyGenerated
          ? "border-2 border-accent/50 bg-accent/5"
          : "border border-text-secondary/30"
      } rounded-xl p-6 space-y-6 transition-all duration-200 hover:shadow-lg max-w-3xl mx-auto`}
    >
      <div className="space-y-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex-1 space-y-1">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder="Enter descriptive name..."
                  className="w-full px-3 py-1.5 bg-bg-primary/50 rounded-lg text-text-primary text-sm 
                    focus:ring-1 focus:ring-accent border border-text-secondary/10"
                  autoFocus
                />
                <button
                  onClick={handleNameUpdate}
                  className="p-1.5 rounded-full bg-accent text-bg-primary hover:bg-accent/90 transition-colors flex-shrink-0"
                >
                  <FiCheck className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-lg font-semibold text-text-primary break-words">
                  {name || "Unnamed Key"}
                </h3>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 rounded-full hover:bg-accent/10 text-accent transition-colors flex-shrink-0"
                  title="Edit name"
                >
                  <FiEdit2 className="h-4 w-4" />
                </button>
              </div>
            )}
            <p className="text-xs text-text-secondary flex flex-wrap items-center gap-2">
              <span>Created: {createdAt ? new Date(createdAt).toLocaleDateString() : "N/A"}</span>
              {status && (
                <>
                  <span>•</span>
                  <span className={`${status === "active" ? "text-green-500" : "text-warning"} capitalize`}>
                    {status}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-accent flex items-center gap-2">
            Public Key
            <button
              className="text-text-secondary hover:text-accent transition-colors"
              title="Your public key is safe to share. It's used to verify your signatures and allows others to encrypt messages for you."
            >
              <FiInfo className="h-4 w-4" />
            </button>
          </label>
          <div className="flex items-center bg-bg-primary/50 rounded-lg p-3 group">
            <div className="flex-1 overflow-hidden">
              <code className="text-sm text-text-primary font-mono whitespace-nowrap overflow-x-auto block
                [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {publicKey}
              </code>
            </div>
            <button
              onClick={() => onCopyToClipboard(publicKey, "public")}
              className="ml-3 px-3 py-1.5 rounded-md bg-accent/10 text-accent text-sm 
                hover:bg-accent/20 transition-colors whitespace-nowrap flex-shrink-0"
            >
              {copiedKey === `public-${publicKey}` ? (
                <span className="flex items-center gap-1">
                  <FiCheck className="h-4 w-4" />
                  Copied
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <FiCopy className="h-4 w-4" />
                  Copy
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-text-secondary flex items-center gap-2">
            Private Key
            <button
              className="text-text-secondary hover:text-accent transition-colors"
              title="Keep your private key secret! It's used to sign messages and decrypt data. Never share it with anyone."
            >
              <FiInfo className="h-4 w-4" />
            </button>
          </label>
          <div className="space-y-2">
            <div className="flex items-center bg-bg-primary/50 rounded-lg p-3 group">
              <code
                className={`text-sm flex-1 font-mono truncate ${
                  showPrivateKey ? "text-danger" : "text-text-primary"
                }`}
              >
                {showPrivateKey ? privateKey : "••••••••••••••••"}
              </code>
              <button
                onClick={() => onTogglePrivateKey(publicKey)}
                className="ml-2 p-2 rounded hover:bg-accent/10 text-accent transition-colors"
                title={showPrivateKey ? "Hide private key" : "Show private key"}
              >
                {showPrivateKey ? (
                  <FiEyeOff className="h-4 w-4" />
                ) : (
                  <FiEye className="h-4 w-4" />
                )}
              </button>
            </div>
            {showPrivateKey && (
              <div className="space-y-2 animate-fadeIn">
                <p className="text-xs text-danger flex items-center gap-2 bg-danger/10 p-2 rounded">
                  <FiAlertTriangle className="h-4 w-4 flex-shrink-0" />
                  <span>
                    Never share your private key. Keep it secure and protected
                    at all times.
                  </span>
                </p>
                <button
                  onClick={() => onCopyToClipboard(privateKey, "private")}
                  className="w-full py-2 px-3 rounded border border-danger text-danger text-sm 
                    hover:bg-danger/10 transition-colors flex items-center justify-center gap-2"
                >
                  {copiedKey === `private-${privateKey}` ? (
                    <>
                      <FiCheck className="h-4 w-4" />
                      Copied to clipboard
                    </>
                  ) : (
                    <>
                      <FiCopy className="h-4 w-4" />
                      Copy Private Key
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {(onDiscard || onDelete) && (
          <div className="flex justify-end items-center gap-2 pt-4 border-t border-text-secondary/30">
            {onDiscard && (
              <button
                onClick={() => onDiscard(publicKey)}
                className="p-2 rounded hover:bg-warning/10 text-warning transition-colors flex items-center gap-1"
                title="Discard Keypair"
              >
                <FiEyeOff className="h-4 w-4" />
                <span className="text-sm">Discard</span>
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(publicKey)}
                className="p-2 rounded hover:bg-danger/10 text-danger transition-colors flex items-center gap-1"
                title="Delete Keypair"
              >
                <FiTrash2 className="h-4 w-4" />
                <span className="text-sm">Delete</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default KeyPair;

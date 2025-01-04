import React from "react";
import { FiEye, FiEyeOff, FiTrash2 } from "react-icons/fi";

interface KeyPairProps {
  publicKey: string;
  privateKey: string;
  status?: string;
  showPrivateKey: boolean;
  copiedKey: string | null;
  onTogglePrivateKey: (publicKey: string) => void;
  onCopyToClipboard: (text: string, keyType: "public" | "private") => void;
  onDiscard?: (publicKey: string) => void;
  onDelete?: (publicKey: string) => void;
  isNewlyGenerated?: boolean;
}

const KeyPair: React.FC<KeyPairProps> = ({
  publicKey,
  privateKey,
  status,
  showPrivateKey,
  copiedKey,
  onTogglePrivateKey,
  onCopyToClipboard,
  onDiscard,
  onDelete,
  isNewlyGenerated,
}) => {
  return (
    <div className={`mt-6 ${
      isNewlyGenerated 
        ? "border-2 border-accent/50 bg-accent/5" 
        : "border border-text-secondary/10"
      } rounded-xl p-6 space-y-6 transition-all duration-200 hover:shadow-lg`}>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-semibold text-accent mb-2 block">
            Public Key
          </label>
          <div className="flex items-center bg-bg-primary/50 rounded-lg p-3">
            <code className="text-sm text-text-primary flex-1 font-mono break-all overflow-x-auto whitespace-pre-wrap max-w-full">
              {publicKey}
            </code>
            <button
              onClick={() => onCopyToClipboard(publicKey, "public")}
              className="ml-3 px-3 py-1.5 rounded-md bg-accent/10 text-accent text-sm hover:bg-accent/20 transition-colors"
            >
              {copiedKey === `public-${publicKey}` ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Private Key
          </label>
          <div className="space-y-2">
            <div className="flex items-center bg-bg-primary rounded p-2">
              <code
                className={`text-xs flex-1 font-mono truncate ${
                  showPrivateKey ? "text-danger" : "text-text-primary"
                }`}
              >
                {showPrivateKey ? privateKey : "••••••••••••••••"}
              </code>
              <button
                onClick={() => onTogglePrivateKey(publicKey)}
                className="ml-2 p-2 rounded hover:bg-accent/10 text-accent"
              >
                {showPrivateKey ? (
                  <FiEyeOff className="h-4 w-4" />
                ) : (
                  <FiEye className="h-4 w-4" />
                )}
              </button>
            </div>
            {showPrivateKey && (
              <div className="space-y-2">
                <p className="text-xs text-danger">
                  Warning: Keep your private key secure and do not share it.
                </p>
                <button
                  onClick={() => onCopyToClipboard(privateKey, "private")}
                  className="w-full py-2 px-3 rounded border border-danger text-danger text-sm hover:bg-danger/10"
                >
                  {copiedKey === `private-${privateKey}`
                    ? "Copied!"
                    : "Copy Private Key"}
                </button>
              </div>
            )}
          </div>
        </div>

        {status && (
          <div className="flex justify-between items-center pt-2 border-t border-text-secondary/10">
            <span className="text-sm text-text-secondary">
              Status: <span className="text-text-primary">{status}</span>
            </span>
            <div className="flex gap-2">
              {onDiscard && (
                <button
                  onClick={() => onDiscard(publicKey)}
                  className="p-2 rounded hover:bg-warning/10 text-warning"
                  title="Discard Keypair"
                >
                  <FiEyeOff className="h-4 w-4" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(publicKey)}
                  className="p-2 rounded hover:bg-danger/10 text-danger"
                  title="Delete Keypair"
                >
                  <FiTrash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KeyPair;

import React, { useState, useEffect } from "react";
import AMACIKeyManager from "../services/keyManager";
import { FiKey, FiTrash2, FiEye, FiEyeOff } from "react-icons/fi";

import { ApprovalRequest } from "./ApprovalRequest";
import SetPassword from "./SetPassword";
import { useAuth } from '../contexts/AuthContext';
import Login from './Login';
import Header from './Header';
import Loading from './Loading';

interface PendingRequest {
  id: string;
  action: string;
  payload: any;
}

const isExtensionEnvironment = (): boolean => {
  return !!(
    typeof chrome !== "undefined" &&
    chrome.runtime &&
    chrome.runtime.id
  );
};

const Dashboard: React.FC = () => {
  const [keyPair, setKeyPair] = useState<{
    publicKey: string;
    privateKey: string;
  } | null>(null);
  const [allKeyPairs, setAllKeyPairs] = useState<
    { publicKey: string; privateKey: string; status: string }[]
  >([]);
  const [password, setPassword] = useState<string>("");
  const [isPasswordSet, setIsPasswordSet] = useState<boolean>(false);
  const [keyManager, setKeyManager] = useState<AMACIKeyManager | null>(null);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [showPrivateKeys, setShowPrivateKeys] = useState<{
    [key: string]: boolean;
  }>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { currentUser, storeEncryptedPassword, getEncryptedPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setIsPasswordSet(false);
      setKeyManager(null);
      setAllKeyPairs([]);
      setIsLoading(false);
      return;
    }
    
    const initializeKeyManager = async () => {
      try {
        const manager = new AMACIKeyManager();
        setKeyManager(manager);
        
        const existingPassword = await manager.getPassword();
        setIsPasswordSet(!!existingPassword);
        
        await fetchKeyPairs();
      } catch (error) {
        console.error("Error initializing:", error);
        setError("Failed to initialize key manager");
      } finally {
        setIsLoading(false);
      }
    };

    initializeKeyManager();
  }, [currentUser]);

  useEffect(() => {
    if (isExtensionEnvironment()) {
      chrome.runtime.sendMessage(
        { action: "getPendingRequests" },
        (response) => {
          if (response?.success) {
            setPendingRequests(response.data);
          }
        }
      );
    }
  }, []);

  const handleSetPassword = async () => {
    if (password && keyManager) {
      await keyManager.setPassword(password);
      const encryptedPassword = await keyManager.getPassword();
      if (encryptedPassword) {
        await storeEncryptedPassword(encryptedPassword);
      }
      setIsPasswordSet(true);
    }
  };

  const handleGenerateKeypair = async () => {
    try {
      setError(null);
      const generatedKeyPair = await keyManager?.generateKeyPair();
      if (generatedKeyPair) {
        setKeyPair(generatedKeyPair);
      } else {
        setKeyPair(null);
        setError("Failed to generate key pair. Please try again.");
      }
      await fetchKeyPairs();
    } catch (error) {
      console.error("Error generating keypair:", error);
      setError(
        "An error occurred while generating the key pair. Please try again."
      );
    }
  };

  const fetchKeyPairs = async () => {
    try {
      const keyPairs = await keyManager?.listKeyPairs();
      setAllKeyPairs(keyPairs || []);
    } catch (error) {
      console.error("Error fetching key pairs:", error);
    }
  };

  const handleDiscardKeyPair = async (publicKey: string) => {
    try {
      await keyManager?.discardKeyPair(publicKey);
      await fetchKeyPairs();
    } catch (error) {
      console.error("Error discarding keypair:", error);
    }
  };

  const handleDeleteKeyPair = async (publicKey: string) => {
    try {
      await keyManager?.deleteKeyPair(publicKey);
      await fetchKeyPairs();
    } catch (error) {
      console.error("Error deleting keypair:", error);
    }
  };

  const handleResolveRequest = (requestId: string, approved: boolean) => {
    if (isExtensionEnvironment()) {
      chrome.runtime.sendMessage(
        { action: "resolveRequest", requestId, approved },
        (response) => {
          if (response?.success) {
            setPendingRequests((prev) =>
              prev.filter((request) => request.id !== requestId)
            );
          }
        }
      );
    }
  };

  useEffect(() => {
    if (isPasswordSet) {
      fetchKeyPairs();
    }
  }, [isPasswordSet]);

  useEffect(() => {
    if (password) {
      const manager = new AMACIKeyManager();
      setKeyManager(manager);
      manager.initializePassword(password);
    }
  }, [password]);

  useEffect(() => {
    if (keyManager && password) {
      keyManager.initializePassword(password);
    }
  }, [keyManager, password]);

  const copyToClipboard = (text: string, keyType: "public" | "private") => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopiedKey(`${keyType}-${text}`);
        setTimeout(() => setCopiedKey(null), 2000);
      },
      (err) => {
        console.error("Could not copy text: ", err);
      }
    );
  };

  const togglePrivateKeyVisibility = (publicKey: string) => {
    setShowPrivateKeys((prev) => ({
      ...prev,
      [publicKey]: !prev[publicKey],
    }));
  };

  const handlePasswordChange = (newPassword: string) => {
    setPassword(newPassword);
  };

  useEffect(() => {
    const recoverPassword = async () => {
      if (currentUser && keyManager) {
        const storedPassword = await getEncryptedPassword();
        if (storedPassword) {
          await keyManager.initializePassword(storedPassword);
          setIsPasswordSet(true);
        }
      }
    };

    recoverPassword();
  }, [currentUser, keyManager]);

  if (isLoading) {
    return <Loading />;
  }

  if (!currentUser) {
    return <Login />;
  }

  return (
    <div>
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-full bg-bg-primary">
          <div className="max-w-3xl mx-auto space-y-6 pb-6">
            {pendingRequests.length > 0 && (
              <section className="bg-bg-secondary rounded-lg p-6 shadow-lg">
                <h2 className="text-xl font-semibold mb-4 text-accent border-b border-accent pb-2">
                  Pending Requests
                </h2>
                <div className="space-y-3">
                  {pendingRequests.map((request) => (
                    <ApprovalRequest
                      key={request.id}
                      action={request.action}
                      payload={request.payload}
                      onApprove={() => handleResolveRequest(request.id, true)}
                      onReject={() => handleResolveRequest(request.id, false)}
                    />
                  ))}
                </div>
              </section>
            )}

            {!isPasswordSet ? (
              <SetPassword
                password={password}
                onPasswordChange={handlePasswordChange}
                onSetPassword={handleSetPassword}
              />
            ) : (
              <>
                <button
                  onClick={handleGenerateKeypair}
                  className="w-full py-3 px-4 rounded bg-accent text-bg-primary font-medium hover:bg-accent/90 transition-colors flex items-center justify-center shadow-md max-w-fit ml-3"
                >
                  <FiKey className="mr-2 h-5 w-5" />
                  Generate New Keypair
                </button>
                {error && (
                  <div className="mt-4 p-3 bg-danger/10 border border-danger rounded text-danger text-sm">
                    {error}
                  </div>
                )}
                {keyPair && (
                  <section className="bg-bg-secondary rounded-lg p-6 shadow-lg">
                    <h2 className="text-xl font-semibold mb-4 text-accent border-b border-accent pb-2">
                      Generated Keypair
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                          Public Key
                        </label>
                        <div className="flex items-center bg-bg-primary rounded p-2">
                          <code className="text-xs text-text-primary flex-1 font-mono truncate">
                            {keyPair.publicKey}
                          </code>
                          <button
                            onClick={() =>
                              copyToClipboard(keyPair.publicKey, "public")
                            }
                            className="ml-2 p-2 rounded hover:bg-accent/10 text-accent"
                          >
                            {copiedKey === `public-${keyPair.publicKey}`
                              ? "Copied!"
                              : "Copy"}
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
                                showPrivateKeys[keyPair.publicKey]
                                  ? "text-danger"
                                  : "text-text-primary"
                              }`}
                            >
                              {showPrivateKeys[keyPair.publicKey]
                                ? keyPair.privateKey
                                : "••••••••••••••••"}
                            </code>
                            <button
                              onClick={() =>
                                togglePrivateKeyVisibility(keyPair.publicKey)
                              }
                              className="ml-2 p-2 rounded hover:bg-accent/10 text-accent"
                            >
                              {showPrivateKeys[keyPair.publicKey] ? (
                                <FiEyeOff className="h-4 w-4" />
                              ) : (
                                <FiEye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                          {showPrivateKeys[keyPair.publicKey] && (
                            <div className="space-y-2">
                              <p className="text-xs text-danger">
                                Warning: Keep your private key secure and do not
                                share it.
                              </p>
                              <button
                                onClick={() =>
                                  copyToClipboard(keyPair.privateKey, "private")
                                }
                                className="w-full py-2 px-3 rounded border border-danger text-danger text-sm hover:bg-danger/10"
                              >
                                {copiedKey === `private-${keyPair.privateKey}`
                                  ? "Copied!"
                                  : "Copy Private Key"}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                <section className="bg-bg-secondary rounded-lg p-6 shadow-lg">
                  <h2 className="text-xl font-semibold mb-4 text-accent border-b border-accent pb-2">
                    All Keypairs
                  </h2>
                  <div className="space-y-4">
                    {allKeyPairs.map((key, index) => (
                      <div
                        key={index}
                        className="p-4 bg-bg-primary rounded-lg border border-text-secondary/10"
                      >
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">
                              Public Key
                            </label>
                            <div className="flex items-center">
                              <code className="text-xs text-text-primary flex-1 font-mono truncate">
                                {key.publicKey}
                              </code>
                              <button
                                onClick={() =>
                                  copyToClipboard(key.publicKey, "public")
                                }
                                className="ml-2 p-2 rounded hover:bg-accent/10 text-accent"
                              >
                                {copiedKey === `public-${key.publicKey}`
                                  ? "Copied!"
                                  : "Copy"}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">
                              Private Key
                            </label>
                            <div className="space-y-2">
                              <div className="flex items-center">
                                <code
                                  className={`text-xs flex-1 font-mono truncate ${
                                    showPrivateKeys[key.publicKey]
                                      ? "text-danger"
                                      : "text-text-primary"
                                  }`}
                                >
                                  {showPrivateKeys[key.publicKey]
                                    ? key.privateKey
                                    : "••••••••••••••••"}
                                </code>
                                <button
                                  onClick={() =>
                                    togglePrivateKeyVisibility(key.publicKey)
                                  }
                                  className="ml-2 p-2 rounded hover:bg-accent/10 text-accent"
                                >
                                  {showPrivateKeys[key.publicKey] ? (
                                    <FiEyeOff className="h-4 w-4" />
                                  ) : (
                                    <FiEye className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                              {showPrivateKeys[key.publicKey] && (
                                <div className="space-y-2">
                                  <p className="text-xs text-danger">
                                    Warning: Keep your private key secure and do not
                                    share it.
                                  </p>
                                  <button
                                    onClick={() =>
                                      copyToClipboard(key.privateKey, "private")
                                    }
                                    className="w-full py-2 px-3 rounded border border-danger text-danger text-sm hover:bg-danger/10"
                                  >
                                    {copiedKey === `private-${key.privateKey}`
                                      ? "Copied!"
                                      : "Copy Private Key"}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex justify-between items-center pt-2 border-t border-text-secondary/10">
                            <span className="text-sm text-text-secondary">
                              Status:{" "}
                              <span className="text-text-primary">
                                {key.status}
                              </span>
                            </span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleDiscardKeyPair(key.publicKey)}
                                className="p-2 rounded hover:bg-warning/10 text-warning"
                                title="Discard Keypair"
                              >
                                <FiEyeOff className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteKeyPair(key.publicKey)}
                                className="p-2 rounded hover:bg-danger/10 text-danger"
                                title="Delete Keypair"
                              >
                                <FiTrash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

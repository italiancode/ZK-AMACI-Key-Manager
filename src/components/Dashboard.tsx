import React, { useState, useEffect } from "react";
import AMACIKeyManager from "../services/keyManager";
import { FiKey } from "react-icons/fi";

import { ApprovalRequest } from "./ApprovalRequest";
import SetPassword from "./SetPassword";
import { useAuth } from "../contexts/AuthContext";
import Login from "./Login";
import Header from "./Header";
import Loading from "./Loading";
import KeyPair from "./KeyPair";
import SignMessage from "./SignMessage";

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
  const { currentUser, storeEncryptedPassword, getEncryptedPassword } =
    useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"keypairs" | "sign">("keypairs");

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

  const handleSignMessage = async (
    publicKey: string,
    message: string,
    metadata: any
  ) => {
    if (!keyManager) throw new Error("Key manager not initialized");
    return await keyManager.signMessage(publicKey, message, metadata);
  };

  if (isLoading) {
    return <Loading />;
  }

  if (!currentUser) {
    return <Login />;
  }

  return (
    <div>
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:py-6 lg:px-8 py-8">
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
                <div className="flex border-b border-text-secondary/10 space-x-2 mb-6">
                  <button
                    className={`px-4 py-2 ${
                      activeTab === "keypairs"
                        ? "bg-accent text-bg-primary font-semibold"
                        : "text-text-secondary hover:bg-bg-secondary"
                    }`}
                    onClick={() => setActiveTab("keypairs")}
                  >
                    Key Pairs
                  </button>
                  <button
                    className={`px-4 py-2 ${
                      activeTab === "sign"
                        ? "bg-accent text-bg-primary font-semibold"
                        : "text-text-secondary hover:bg-bg-secondary"
                    }`}
                    onClick={() => setActiveTab("sign")}
                  >
                    Sign Message
                  </button>
                </div>

                {activeTab === "keypairs" ? (
                  <>
                    <button
                      onClick={handleGenerateKeypair}
                      className="w-full py-3 px-4 rounded bg-accent text-bg-primary font-medium hover:bg-accent/90 transition-colors flex items-center justify-center shadow-md max-w-fit"
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
                        <KeyPair
                          publicKey={keyPair.publicKey}
                          privateKey={keyPair.privateKey}
                          showPrivateKey={
                            showPrivateKeys[keyPair.publicKey] || false
                          }
                          copiedKey={copiedKey}
                          onTogglePrivateKey={togglePrivateKeyVisibility}
                          onCopyToClipboard={copyToClipboard}
                          isNewlyGenerated={true}
                        />
                      </section>
                    )}

                    <section className="bg-bg-secondary rounded-lg p-6 shadow-lg">
                      <h2 className="text-xl font-semibold mb-4 text-accent border-b border-accent pb-2">
                        All Keypairs
                      </h2>

                      {allKeyPairs.map((key, index) => (
                        <KeyPair
                          key={index}
                          publicKey={key.publicKey}
                          privateKey={key.privateKey}
                          status={key.status}
                          showPrivateKey={
                            showPrivateKeys[key.publicKey] || false
                          }
                          copiedKey={copiedKey}
                          onTogglePrivateKey={togglePrivateKeyVisibility}
                          onCopyToClipboard={copyToClipboard}
                          onDiscard={handleDiscardKeyPair}
                          onDelete={handleDeleteKeyPair}
                        />
                      ))}
                    </section>
                  </>
                ) : (
                  <SignMessage
                    keyPairs={allKeyPairs}
                    onSignMessage={handleSignMessage}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

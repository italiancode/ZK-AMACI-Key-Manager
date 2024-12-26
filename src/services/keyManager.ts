import nacl from "tweetnacl";
import {
  encode as encodeBase64,
  decode as decodeBase64,
} from "base64-arraybuffer";

interface KeyPair {
  publicKey: string;
  privateKey: string;
  status: "active" | "discarded";
}

interface SigningMetadata {
  proposalInfo?: {
    id: string;
    title: string;
    description?: string;
    [key: string]: any;
  };
  userAction?: {
    type: 'vote' | 'delegate';
    choice?: string | number;
    delegatee?: string;
    [key: string]: any;
  };
  context?: {
    round?: number;
    epoch?: number;
    timestamp: number;
    [key: string]: any;
  };
  [key: string]: any;
}

interface SignatureResponse {
  signature: string;
  signatureHash: string;
  metadata: SigningMetadata;
}

class AMACIKeyManager {
  private encryptionPassword: string | null = null;
  private keyStorageName = "amaci-keys";
  private passwordStorageName = "amaci-password";

  constructor() {
    if (!indexedDB) {
      throw new Error("IndexedDB is required for secure key storage.");
    }
  }

  // Opens or creates the IndexedDB database
  private async openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.keyStorageName, 1);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.keyStorageName)) {
          db.createObjectStore(this.keyStorageName, { keyPath: "publicKey" });
        }
        if (!db.objectStoreNames.contains(this.passwordStorageName)) {
          db.createObjectStore(this.passwordStorageName, { keyPath: "id" });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async performDBTransaction(
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => Promise<void>
  ) {
    const db = await this.openDatabase();
    const tx = db.transaction(this.keyStorageName, mode);
    const store = tx.objectStore(this.keyStorageName);

    await operation(store);

    return new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = (event) => reject((event.target as IDBRequest).error);
    });
  }

  private async encryptData(
    data: Uint8Array,
    password: string
  ): Promise<string> {
    const key = await this.deriveKey(password);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      data
    );
    return encodeBase64(new Uint8Array([...iv, ...new Uint8Array(encrypted)]));
  }

  private async decryptData(
    encryptedData: string,
    password: string
  ): Promise<ArrayBuffer> {
    const key = await this.deriveKey(password);
    const encryptedBuffer = decodeBase64(encryptedData);
    const iv = encryptedBuffer.slice(0, 12);
    const data = encryptedBuffer.slice(12);

    return await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
  }
  // Sets the password in the password storage
  async setPassword(password: string): Promise<void> {
    const encryptedPassword = await this.encryptData(
      new TextEncoder().encode(password),
      password
    );

    const db = await this.openDatabase();
    const tx = db.transaction(this.passwordStorageName, "readwrite");
    const store = tx.objectStore(this.passwordStorageName);

    await new Promise((resolve, reject) => {
      const request = store.put({
        id: "user-password",
        password: encryptedPassword,
      });
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  // Retrieves the password from the password storage
  async getPassword(): Promise<string | null> {
    const db = await this.openDatabase();
    const tx = db.transaction(this.passwordStorageName, "readonly");
    const store = tx.objectStore(this.passwordStorageName);

    return new Promise((resolve, reject) => {
      const request = store.get("user-password");
      request.onsuccess = () => {
        resolve(request.result?.password || null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Deletes the password from the password storage
  async deletePassword(): Promise<void> {
    const db = await this.openDatabase();
    const tx = db.transaction(this.passwordStorageName, "readwrite");
    const store = tx.objectStore(this.passwordStorageName);

    await new Promise<void>((resolve, reject) => {
      const request = store.delete("user-password");
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async initializePassword(password: string): Promise<void> {
    const existingPassword = await this.getPassword();
    if (existingPassword) {
      console.log("Password already set. Using existing password.");
      this.encryptionPassword = existingPassword;
    } else {
      if (password) {
        await this.setPassword(password);
        this.encryptionPassword = password; // Store the password in memory
        console.log("Password set successfully.");
      } else {
        console.log("No password provided to set.");
      }
    }
  }

  async generateKeyPair(): Promise<KeyPair> {
    if (!this.encryptionPassword) {
      this.encryptionPassword = await this.getPassword();
      if (!this.encryptionPassword) {
        throw new Error("Password not set. Please set a password first.");
      }
    }

    const keyPair = nacl.sign.keyPair();
    const encryptedPrivateKey = await this.encryptData(
      keyPair.secretKey,
      this.encryptionPassword
    );

    const newKeyPair: KeyPair = {
      publicKey: encodeBase64(keyPair.publicKey),
      privateKey: encryptedPrivateKey,
      status: "active",
    };

    await this.performDBTransaction("readwrite", async (store) => {
      store.add(newKeyPair);
    });

    return newKeyPair;
  }

  private async deriveKey(password: string): Promise<CryptoKey> {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      enc.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );

    return crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: enc.encode("amaci-key-management"),
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }

  async listKeyPairs(): Promise<KeyPair[]> {
    const db = await this.openDatabase();
    const tx = db.transaction(this.keyStorageName, "readonly");
    const request = tx.objectStore(this.keyStorageName).getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async discardKeyPair(publicKey: string) {
    const allKeys = await this.listKeyPairs();
    const keyToDiscard = allKeys.find((key) => key.publicKey === publicKey);

    if (keyToDiscard) {
      keyToDiscard.status = "discarded";

      await this.performDBTransaction("readwrite", async (store) => {
        store.put(keyToDiscard);
      });
    }
  }

  async deleteKeyPair(publicKey: string): Promise<void> {
    await this.performDBTransaction("readwrite", async (store) => {
      store.delete(publicKey);
    });
  }

  async recoverKeyPair(): Promise<void> {
    const keyPairs = await this.listKeyPairs();
    const activeKeyPair = keyPairs.find((key) => key.status === "active");

    if (activeKeyPair) {
      if (!this.encryptionPassword) {
        this.encryptionPassword = await this.getPassword();
        if (!this.encryptionPassword) {
          throw new Error("Encryption password is not set.");
        }
      }

      const decryptedPrivateKey = await this.decryptData(
        activeKeyPair.privateKey,
        this.encryptionPassword
      );
      console.log(
        "Recovered Key Pair:",
        activeKeyPair.publicKey,
        new Uint8Array(decryptedPrivateKey)
      );
    } else {
      throw new Error("No active key pair found for recovery.");
    }
  }

  async signMessage(
    publicKey: string,
    message: string,
    metadata: SigningMetadata
  ): Promise<SignatureResponse> {
    const allKeys = await this.listKeyPairs();
    const key = allKeys.find((k) => k.publicKey === publicKey);

    if (!key || key.status === "discarded") {
      throw new Error("Key pair not found or discarded.");
    }

    if (!this.encryptionPassword) {
      this.encryptionPassword = await this.getPassword();
      if (!this.encryptionPassword) {
        throw new Error("Encryption password is not set.");
      }
    }

    // Add timestamp if not provided
    if (!metadata.context) {
      metadata.context = { timestamp: Date.now() };
    } else if (!metadata.context.timestamp) {
      metadata.context.timestamp = Date.now();
    }

    // Combine message with metadata
    const messageWithMetadata = {
      message,
      metadata,
    };

    const decryptedPrivateKey = await this.decryptData(
      key.privateKey,
      this.encryptionPassword
    );

    const privateKey = new Uint8Array(decryptedPrivateKey);
    const messageBuffer = new TextEncoder().encode(JSON.stringify(messageWithMetadata));
    const signature = nacl.sign.detached(messageBuffer, privateKey);

    const signatureHex = Array.from(signature)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");

    const signatureHash = await this.hashData(signatureHex);

    return {
      signature: encodeBase64(signature),
      signatureHash,
      metadata
    };
  }

  async hashData(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
    return hashHex;
  }
}

export default AMACIKeyManager;

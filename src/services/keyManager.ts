import { auth } from "../config/firebase";
import nacl from "tweetnacl";
import {
  encode as encodeBase64,
  decode as decodeBase64,
} from "base64-arraybuffer";

import PasswordManager from './passwordManager';

interface KeyPair {
  publicKey: string;
  privateKey: string;
  status: string;
  name?: string;
  createdAt?: string;
}

interface SigningMetadata {
  proposalInfo?: {
    id: string;
    title: string;
    description?: string;
    [key: string]: any;
  };
  userAction?: {
    type: "vote" | "delegate";
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
  private keyStorageName = "amaci-keys";
  private passwordManager: PasswordManager;

  constructor() {
    this.passwordManager = new PasswordManager();
  }

  async setPassword(password: string): Promise<void> {
    await this.passwordManager.setPassword(password);
  }

  async getPassword(): Promise<string | null> {
    return this.passwordManager.getPassword();
  }

  // Initialize password from Firebase
  async initializePassword(password?: string): Promise<void> {
    if (password) {
      await this.setPassword(password);
    } else {
      const storedPassword = await this.getPassword();
      if (storedPassword) {
        await this.passwordManager.setPassword(storedPassword);
      }
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
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async performDBTransaction(
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => Promise<void>
  ): Promise<void> {
    const db = await this.openDatabase();
    return new Promise<void>(async (resolve, reject) => {
      try {
        const tx = db.transaction(this.keyStorageName, mode);
        const store = tx.objectStore(this.keyStorageName);

        // Set up transaction event handlers first
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onerror = () => {
          db.close();
          reject(tx.error);
        };
        tx.onabort = () => {
          db.close();
          reject(new Error('Transaction aborted'));
        };

        // Perform the operation
        await operation(store);
      } catch (error) {
        db.close();
        reject(error);
      }
    });
  }

  private async encryptData(
    data: Uint8Array,
    password: string
  ): Promise<string> {
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new Error("User must be authenticated and have an email");
    }

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
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new Error("User must be authenticated and have an email");
    }

    const key = await this.deriveKey(password);
    const encryptedBuffer = decodeBase64(encryptedData);
    const iv = encryptedBuffer.slice(0, 12);
    const data = encryptedBuffer.slice(12);

    return await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
  }

  private generateRandomName(): string {
    const adjectives = ['Primary', 'Backup', 'Secure', 'Personal', 'Work', 'Test', 'Development', 'Production'];
    const purposes = ['Identity', 'Signing', 'Authentication', 'Access', 'Wallet', 'Account'];
    const randomNum = Math.floor(Math.random() * 1000);
    
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const purpose = purposes[Math.floor(Math.random() * purposes.length)];
    
    return `${adjective} ${purpose} Key ${randomNum}`;
  }

  async generateKeyPair(): Promise<KeyPair> {
    console.log("Generating key pair");
    const password = this.passwordManager.getCurrentPassword() || await this.getPassword();

    // console.log("Password:", password);
    if (!password) {
      throw new Error("Password not set. Please set a password first.");
    }

    const keyPair = nacl.sign.keyPair();

    // console.log("Key pair:", keyPair);

    console.log("Encrypting private key");
    const encryptedPrivateKey = await this.encryptData(
      keyPair.secretKey,
      password
    );

    // console.log("Encrypted private key:", encryptedPrivateKey);

    const newKeyPair: KeyPair = {
      publicKey: encodeBase64(keyPair.publicKey),
      privateKey: encryptedPrivateKey,
      status: "active",
      name: this.generateRandomName(),
      createdAt: new Date().toISOString()
    };

    // console.log("New key pair:", newKeyPair);

    await this.performDBTransaction("readwrite", async (store) => {
      store.add(newKeyPair);
    });

    // console.log("Key pair added to database");

    return newKeyPair;
  }

  private async deriveKey(password: string): Promise<CryptoKey> {
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new Error("User must be authenticated and have an email");
    }

    const enc = new TextEncoder();
    // Combine password with email for stronger key derivation
    const combinedSecret = `${password}:${user.email}`;
    
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      enc.encode(combinedSecret),
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
      const password = this.passwordManager.getCurrentPassword() || await this.getPassword();
      if (!password) {
        throw new Error("Encryption password is not set.");
      }

      const decryptedPrivateKey = await this.decryptData(
        activeKeyPair.privateKey,
        password
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

    const password = this.passwordManager.getCurrentPassword() || await this.getPassword();
    if (!password) {
      throw new Error("Encryption password is not set.");
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
      password
    );

    const privateKey = new Uint8Array(decryptedPrivateKey);
    const messageBuffer = new TextEncoder().encode(
      JSON.stringify(messageWithMetadata)
    );
    const signature = nacl.sign.detached(messageBuffer, privateKey);

    const signatureHex = Array.from(signature)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");

    const signatureHash = await this.hashData(signatureHex);

    return {
      signature: encodeBase64(signature),
      signatureHash,
      metadata,
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

  async updateKeyPairName(publicKey: string, name: string): Promise<void> {
    const allKeys = await this.listKeyPairs();
    const keyToUpdate = allKeys.find((key) => key.publicKey === publicKey);

    if (keyToUpdate) {
      keyToUpdate.name = name;
      await this.performDBTransaction("readwrite", async (store) => {
        store.put(keyToUpdate);
      });
    }
  }
}

export default AMACIKeyManager;

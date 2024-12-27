import nacl from "tweetnacl";
import {
  encode as encodeBase64,
  decode as decodeBase64,
} from "base64-arraybuffer";
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from "../config/firebase";

class PasswordManager {
  private encryptionPassword: string | null = null;

  // Encrypt password before storing
  private encryptPassword(password: string): string {
    const encoder = new TextEncoder();
    const passwordBytes = encoder.encode(password);
    const key = nacl.randomBytes(nacl.secretbox.keyLength);
    const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
    const encryptedBytes = nacl.secretbox(passwordBytes, nonce, key);
    const result = new Uint8Array([...key, ...nonce, ...encryptedBytes]);
    return encodeBase64(result);
  }

  // Decrypt stored password
  private decryptPassword(encryptedData: string): string {
    const data = new Uint8Array(decodeBase64(encryptedData));
    const key = data.slice(0, nacl.secretbox.keyLength);
    const nonce = data.slice(
      nacl.secretbox.keyLength,
      nacl.secretbox.keyLength + nacl.secretbox.nonceLength
    );
    const encryptedBytes = data.slice(nacl.secretbox.keyLength + nacl.secretbox.nonceLength);
    const decryptedBytes = nacl.secretbox.open(encryptedBytes, nonce, key);
    if (!decryptedBytes) throw new Error("Failed to decrypt password");
    return new TextDecoder().decode(decryptedBytes);
  }

  async setPassword(password: string): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User must be authenticated");

      const encryptedPassword = this.encryptPassword(password);
      const docRef = doc(db, `users/${user.uid}/passwords/master`);
      await setDoc(docRef, { 
        encryptedPassword,
        updatedAt: new Date().toISOString()
      });
      
      this.encryptionPassword = password;
    } catch (error) {
      console.error("Error setting password:", error);
      throw error;
    }
  }

  async getPassword(): Promise<string | null> {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User must be authenticated");

      const docRef = doc(db, `users/${user.uid}/passwords/master`);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) return null;
      
      const { encryptedPassword } = docSnap.data();
      if (!encryptedPassword) return null;

      return this.decryptPassword(encryptedPassword);
    } catch (error) {
      console.error("Error getting password:", error);
      throw error;
    }
  }

  getCurrentPassword(): string | null {
    return this.encryptionPassword;
  }
}

export default PasswordManager; 
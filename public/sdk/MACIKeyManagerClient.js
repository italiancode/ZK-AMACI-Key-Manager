export class MACIKeyManagerClient {
  static EXTENSION_ID = "nfjlopmodlkncchpfkoglbjfjagdahbj";

  static isExtensionAvailable() {
    return !!(window.chrome && chrome.runtime && chrome.runtime.sendMessage);
  }

  static sendRequest(payload) {
    if (!this.isExtensionAvailable()) {
      throw new Error("MACI Key Manager Extension is not installed");
    }

    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        this.EXTENSION_ID,
        {
          type: "MACI_REQUEST",
          payload,
        },
        (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          if (response?.type === "MACI_RESPONSE") {
            resolve(response.payload);
          } else if (response?.type === "MACI_ERROR") {
            reject(new Error(response.payload));
          }
        }
      );
    });
  }

  static async generateKeypair() {
    try {
      const result = await this.sendRequest({
        action: "generateKeypair",
      });
      console.log(result);
      return result;
    } catch (error) {
      console.error("Failed to generate keypair:", error);
      throw error;
    }
  }

  static async signMessage(publicKey, message, metadata) {
    try {
      const result = await this.sendRequest({
        action: "signMessage",
        publicKey,
        message,
        metadata
      });
      console.log(result);
      return result;
    } catch (error) {
      console.error("Failed to sign message:", error);
      throw error;
    }
  }
} 
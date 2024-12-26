declare global {
  interface Window {
    chrome: typeof chrome;
  }
}

export class MACIKeyManagerClient {
  static EXTENSION_ID = "nfjlopmodlkncchpfkoglbjfjagdahbj";

  private static isExtensionAvailable(): boolean {
    return !!(window.chrome && chrome.runtime && chrome.runtime.sendMessage);
  }

  private static sendRequest(payload: any): Promise<any> {
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

  static async signMessage(publicKey: string, message: string, metadata: any) {
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
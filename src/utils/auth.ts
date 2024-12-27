import { EXTENSION_ID } from "../config/constants";
import { getAuthToken } from "../services/firebase";

export const handleExternalAuth = async () => {
  if (chrome.runtime && chrome.runtime.id) {
    // We're in the extension - open external auth page
    const authUrl = "http://localhost:5173/auth";
    const authWindow = await chrome.windows.create({
      url: authUrl,
      type: "popup",
      width: 600,
      height: 600,
    });

    // Listen for messages from the auth page
    return new Promise((resolve) => {
      chrome.runtime.onMessageExternal.addListener((message) => {
        if (message.type === "AUTH_SUCCESS" && message.token) {
          chrome.windows.remove(authWindow.id!);
          resolve(message.token);
        }
      });
    });
  } else {
    // We're in the web auth page
    const token = await getAuthToken(); // Or any other auth logic
    // Send token back to extension
    chrome.runtime.sendMessage(EXTENSION_ID, {
      type: "AUTH_SUCCESS",
      token: token,
    });
  }
};

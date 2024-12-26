import AMACIKeyManager from "./services/keyManager";

// Create an instance of AMACIKeyManager
const keyManager = new AMACIKeyManager();

// Create a store for pending requests
const pendingRequests: Array<{
  id: string;
  action: string;
  payload: any;
  resolver: (approved: boolean) => void;
}> = [];

async function requestUserApproval(
  action: string,
  payload: any
): Promise<boolean> {
  return new Promise((resolve) => {
    const requestId = crypto.randomUUID();
    pendingRequests.push({ id: requestId, action, payload, resolver: resolve });

    // Update badge to show pending requests
    chrome.action.setBadgeText({ text: pendingRequests.length.toString() });
    chrome.action.setBadgeBackgroundColor({ color: "#FF0000" });

    chrome.action.openPopup();
  });
}

chrome.runtime.onInstalled.addListener(() => {
  console.log("MACI Key Manager Installed");
});

// Handle external messages (from web pages)
chrome.runtime.onMessageExternal.addListener(
  async (message, _sender, sendResponse) => {
    if (message.type === "PING") {
      sendResponse({ type: "PONG" });
      return;
    }

    if (message.type === "MACI_REQUEST") {
      // For sensitive operations, request user approval
      if (["generateKeypair", "signMessage"].includes(message.payload.action)) {
        try {
          const approved = await requestUserApproval(
            message.payload.action,
            message.payload
          );

          if (approved) {
            // User approved the action, process it
            switch (message.payload.action) {
              case "generateKeypair":
                const keypair = await keyManager.generateKeyPair();
                sendResponse({
                  type: "MACI_RESPONSE",
                  payload: { success: true, data: keypair },
                });
                break;
              case "signMessage":
                const { publicKey, message: msgToSign, metadata } = message.payload;
                try {
                  const signatureData = await keyManager.signMessage(
                    publicKey, 
                    msgToSign,
                    {
                      proposalInfo: metadata?.proposalInfo,
                      userAction: metadata?.userAction,
                      context: metadata?.context
                    }
                  );
                  sendResponse({
                    type: "MACI_RESPONSE",
                    payload: { success: true, data: signatureData }
                  });
                } catch (error) {
                  sendResponse({
                    type: "MACI_ERROR",
                    payload: error instanceof Error ? error.message : "Signing failed"
                  });
                }
                break;
            }
          } else {
            // User rejected the action
            sendResponse({
              type: "MACI_ERROR",
              payload: "User rejected the action",
            });
          }
        } catch (error) {
          sendResponse({
            type: "MACI_ERROR",
            payload:
              error instanceof Error ? error.message : "Unknown error occurred",
          });
        }
        return true;
      }

      try {
        switch (message.payload.action) {
          case "listKeys":
            const keys = await keyManager.listKeyPairs();
            sendResponse({
              type: "MACI_RESPONSE",
              payload: { success: true, data: keys },
            });
            break;

          default:
            sendResponse({
              type: "MACI_ERROR",
              payload: "Unknown action",
            });
        }
      } catch (error) {
        sendResponse({
          type: "MACI_ERROR",
          payload:
            error instanceof Error ? error.message : "Unknown error occurred",
        });
      }
    }
    return true;
  }
);

// Handle internal extension messages
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  switch (request.action) {
    case "generateKeypair":
      keyManager
        .generateKeyPair()
        .then((keypair) => sendResponse({ success: true, data: keypair }))
        .catch((error) =>
          sendResponse({ success: false, error: error.message })
        );
      return true;

    case "signMessage":
      const { publicKey, message } = request;
      keyManager
        .signMessage(publicKey, message, {
          context: { timestamp: Date.now() }
        })
        .then((signature) => sendResponse({ success: true, data: signature }))
        .catch((error) =>
          sendResponse({ success: false, error: error.message })
        );
      return true;

    case "getPendingRequests":
      sendResponse({
        success: true,
        data: pendingRequests.map(({ id, action, payload }) => ({
          id,
          action,
          payload,
        })),
      });
      return true;

    case "resolveRequest":
      const { requestId, approved } = request;
      const requestIndex = pendingRequests.findIndex(
        (req) => req.id === requestId
      );
      if (requestIndex >= 0) {
        const { resolver } = pendingRequests[requestIndex];
        pendingRequests.splice(requestIndex, 1);
        resolver(approved);

        // Update badge
        if (pendingRequests.length === 0) {
          chrome.action.setBadgeText({ text: "" });
        } else {
          chrome.action.setBadgeText({
            text: pendingRequests.length.toString(),
          });
        }

        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: "Request not found" });
      }
      return true;
  }
});

// Redundant code block removed for clarity.

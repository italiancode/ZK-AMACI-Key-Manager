// Listen for messages from the webpage
window.addEventListener('message', async (event) => {
  // Verify the message origin for security
  if (event.source !== window) return;

  const { type, payload } = event.data;
  
  if (type === 'MACI_REQUEST') {
    try {
      // Forward the request to the extension's background script
      const response = await chrome.runtime.sendMessage(payload);
      
      // Send the response back to the webpage
      window.postMessage({
        type: 'MACI_RESPONSE',
        payload: response
      }, '*');
    } catch (error: unknown) {
      window.postMessage({
        type: 'MACI_ERROR',
        payload: error instanceof Error ? error.message : 'Unknown error occurred'
      }, '*');
    }
  }
});

// Inject a script to help websites detect the extension
const script = document.createElement('script');
script.textContent = `
  window.maciKeyManagerAvailable = true;
`;
(document.head || document.documentElement).appendChild(script); 
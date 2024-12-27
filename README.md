# ZK-AMACI Key Manager Browser Extension

A secure browser extension for managing and signing Zero-Knowledge AMACI (Anonymous Minimal Anti-Collusion Infrastructure) keypairs. This extension helps users securely generate and store keypairs while providing a safe signing interface for dApps.

## Features

- 🔐 Secure keypair generation and storage
- ✍️ Message signing with metadata support
- 🔒 Isolated key storage environment
- 🌐 dApp integration support
- 🎨 Modern UI with Tailwind CSS
- 📱 Responsive design
- 👤 User authentication with Google/GitHub
- 🔑 Encrypted password storage
- 🛡️ Firebase security rules for data protection

## Security Features

### Authentication
- Secure user authentication via Google and GitHub
- Session management with Firebase Auth
- Protected routes and components

### Password Security
- Encrypted password storage in Firebase
- User-specific data isolation
- Secure password recovery mechanism
- Client-side password encryption
- No plaintext password storage

### Key Management
- Private key visibility toggle
- Secure key deletion
- Key status tracking (active/discarded)
- Copy protection for sensitive data
- Warning messages for private key exposure

## Project Structure
```
zk-azk-amaci-key-manager/
├── dist/                 # Build output directory
├── public/              
│   ├── sdk/             # Client SDK for dApp integration
│   └── manifest.json    # Extension manifest
├── src/
│   ├── assets/         # Static assets
│   ├── components/     # React components
│   │   ├── Dashboard.tsx    # Main dashboard
│   │   ├── Header.tsx      # Navigation header
│   │   ├── Login.tsx       # Authentication
│   │   └── SetPassword.tsx # Password management
│   ├── contexts/       # React contexts
│   │   └── AuthContext.tsx # Authentication context
│   ├── services/       # Core services
│   │   └── keyManager.ts   # Key management logic
│   ├── config/         # Configuration
│   │   └── firebase.ts     # Firebase setup
│   ├── styles/         # CSS styles
│   └── sdk/            # TypeScript SDK
└── demo.html           # Demo page for testing
```

## Firebase Security Rules

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /passwords/{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

## Prerequisites

- Node.js >= 14.18.0
- npm >= 8.0.0
- Chrome browser

## Installation

1. Clone the repository:
```bash
git clone https://github.com/italiancode/zk-amaci-key-manager.git
cd zk-amaci-key-manager
```

2. Install dependencies:
```bash
npm install
```

3. Build the extension:
```bash
npm run build
```

## Loading the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select the `dist` folder from the project

## Development

Start the development server with hot reload:
```bash
npm run dev
```

Lint the code:
```bash
npm run lint
```

## Testing with demo.html

The `demo.html` file provides a testing interface for the extension:

1. Start a local server (e.g., using `npx http-server`)
2. Open `demo.html` in your browser
3. Test the following features:
   - Extension detection
   - Keypair generation
   - Message signing with metadata
   - Vote and delegate actions

### Example Metadata Structure
```javascript
{
  proposalInfo: {
    id: "proposal-123",
    title: "Community Fund Allocation"
  },
  userAction: {
    type: "vote",  // or "delegate"
    choice: "yes"  // or delegatee address for delegation
  },
  context: {
    round: 1,
    epoch: 2,
    timestamp: Date.now()
  }
}
```

## dApp Integration

### 1. Include the Client SDK
```html
<script type="module">
  import { MACIKeyManagerClient } from '/public/sdk/MACIKeyManagerClient.js';
  window.MACIKeyManagerClient = MACIKeyManagerClient;
</script>
```

### 2. Basic Usage
```javascript
// Generate a keypair
const keypair = await MACIKeyManagerClient.generateKeypair();

// Sign a message
const signature = await MACIKeyManagerClient.signMessage(
  publicKey,
  message,
  metadata
);
```

## Building for Production

1. Update the extension version in `manifest.json`
2. Build the production version:
```bash
npm run build
```
3. The extension will be built to the `dist` directory

## Security Features

- Secure key storage using Chrome's extension storage
- Isolated execution environment
- Request origin validation
- Metadata verification
- User approval for all sensitive operations

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

[Add your license here]

## Support

For issues and feature requests, please [open an issue](https://github.com/italiancode/zk-amaci-key-manager/issues).

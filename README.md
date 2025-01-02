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

## Project Structure
```
zk-azk-amaci-key-manager/
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx    # Main dashboard container
│   │   ├── KeyPairs.tsx    # Keypair management UI
│   │   ├── SignMessage.tsx # Message signing UI
│   │   ├── Header.tsx      # Navigation header
│   │   ├── Login.tsx       # Authentication
│   │   └── SetPassword.tsx # Password management
│   ├── contexts/
│   │   └── AuthContext.tsx # Authentication context
│   ├── services/
│   │   ├── keyManager.ts   # Key management logic
│   │   └── passwordManager.ts # Password encryption
│   └── config/
│       └── firebase.ts     # Firebase setup
```

## Firebase Security Rules

Add these rules to your Firebase project:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read/write their own documents
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Components

### KeyPairs
Manages the display and interaction with keypairs:
- Generate new keypairs
- View public/private keys
- Copy keys to clipboard
- Discard/delete keypairs

### SignMessage
Handles message signing functionality:
- Select active keypair
- Input message and metadata
- Sign messages
- View signature results

### Dashboard
Main container component that:
- Manages authentication state
- Handles password management
- Coordinates between KeyPairs and SignMessage
- Manages pending requests

## Installation & Setup

1. Clone and install dependencies:
```bash
git clone https://github.com/italiancode/zk-amaci-key-manager.git
cd zk-amaci-key-manager
npm install
```

2. Configure Firebase:
- Create a Firebase project
- Enable Authentication (Google & GitHub)
- Set up Firestore database
- Add security rules
- Update `src/config/firebase.ts` with your credentials

3. Build the extension:
```bash
npm run build
```

4. Load in Chrome:
- Go to `chrome://extensions/`
- Enable Developer mode
- Click "Load unpacked"
- Select the `dist` folder

## Development

```bash
npm run dev
```

## Testing

```bash
npm test
```

## Security Considerations

- All private keys are encrypted before storage
- Passwords are never stored in plaintext
- Firebase rules enforce user isolation
- Client-side encryption for sensitive data
- Secure key deletion process

## License

[MIT](LICENSE)

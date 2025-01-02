import React, { useState } from 'react';
import { FiCheck } from 'react-icons/fi';

interface SignMessageProps {
  keyPairs: { publicKey: string; status: string }[];
  onSignMessage: (publicKey: string, message: string, metadata: any) => Promise<any>;
}

const SignMessage: React.FC<SignMessageProps> = ({ keyPairs, onSignMessage }) => {
  const [selectedKey, setSelectedKey] = useState('');
  const [message, setMessage] = useState('');
  const [metadata, setMetadata] = useState('{}');
  const [signature, setSignature] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSign = async () => {
    try {
      setError('');
      setSignature(null);
      const parsedMetadata = JSON.parse(metadata);
      const result = await onSignMessage(selectedKey, message, parsedMetadata);
      setSignature(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign message');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="space-y-4 sm:space-y-6">
        <div>
          <label htmlFor="key-select" className="block text-sm sm:text-base font-medium text-text-secondary mb-2">
            Select Key
          </label>
          <select
            id="key-select"
            value={selectedKey}
            onChange={(e) => setSelectedKey(e.target.value)}
            className="w-full p-2 sm:p-3 rounded-md bg-bg-primary border border-text-secondary/10 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">Select a key...</option>
            {keyPairs.filter(k => k.status === 'active').map((key) => (
              <option key={key.publicKey} value={key.publicKey}>
                {key.publicKey.substring(0, 16)}...
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="message-input" className="block text-sm sm:text-base font-medium text-text-secondary mb-2">
            Message
          </label>
          <textarea
            id="message-input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-2 sm:p-3 rounded-md bg-bg-primary border border-text-secondary/10 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-accent"
            rows={4}
          />
        </div>

        <div>
          <label htmlFor="metadata-input" className="block text-sm sm:text-base font-medium text-text-secondary mb-2">
            Metadata (JSON)
          </label>
          <textarea
            id="metadata-input"
            value={metadata}
            onChange={(e) => setMetadata(e.target.value)}
            className="w-full p-2 sm:p-3 rounded-md bg-bg-primary border border-text-secondary/10 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-accent"
            rows={4}
          />
        </div>

        <button
          onClick={handleSign}
          disabled={!selectedKey || !message}
          className="w-full py-3 px-4 rounded-md bg-accent text-bg-primary font-medium text-sm sm:text-base hover:bg-accent/90 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiCheck className="mr-2 h-5 w-5" />
          Sign Message
        </button>
      </div>

      {error && (
        <div className="p-3 sm:p-4 bg-danger/10 border border-danger rounded-md text-danger text-sm sm:text-base">
          {error}
        </div>
      )}

      {signature && (
        <div className="space-y-4 p-4 sm:p-6 bg-bg-primary rounded-lg border border-text-secondary/10">
          <div>
            <h3 className="text-sm sm:text-base font-medium text-text-secondary mb-2">Signature</h3>
            <code className="text-xs sm:text-sm block p-2 sm:p-3 bg-bg-secondary rounded-md overflow-x-auto whitespace-pre-wrap break-all">
              {signature.signature}
            </code>
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-medium text-text-secondary mb-2">Signature Hash</h3>
            <code className="text-xs sm:text-sm block p-2 sm:p-3 bg-bg-secondary rounded-md overflow-x-auto whitespace-pre-wrap break-all">
              {signature.signatureHash}
            </code>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignMessage;


import React, { useState } from 'react';
import { FiCheck } from 'react-icons/fi';

interface SignMessageProps {
  keyPairs: { publicKey: string; status: string }[];
  onSignMessage: (publicKey: string, message: string, metadata: any) => Promise<any>;
}

const SignMessage: React.FC<SignMessageProps> = ({ keyPairs, onSignMessage }) => {
  const [selectedKey, setSelectedKey] = useState('');
  const [message, setMessage] = useState('');
  const [metadata, setMetadata] = useState(JSON.stringify({
    timestamp: new Date().toISOString(),
    version: "1.0",
    type: "message",
    tags: [],
    additional: {}
  }, null, 2));
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
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-bg-secondary/95 backdrop-blur-sm rounded-xl shadow-xl p-6 space-y-8">
        <h2 className="text-2xl font-bold text-accent border-b border-accent/20 pb-4">
          Sign Message
        </h2>

        <div className="space-y-6">
          <div>
            <label htmlFor="key-select" className="block text-sm font-semibold text-text-secondary mb-2">
              Select Key
            </label>
            <select
              id="key-select"
              value={selectedKey}
              onChange={(e) => setSelectedKey(e.target.value)}
              className="w-full p-3 rounded-lg bg-bg-primary border border-text-secondary/10 text-text-primary focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200"
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
            <label htmlFor="message-input" className="block text-sm font-semibold text-text-secondary mb-2">
              Message
            </label>
            <textarea
              id="message-input"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 rounded-lg bg-bg-primary border border-text-secondary/10 text-text-primary focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200 min-h-[120px]"
              placeholder="Enter your message here..."
            />
          </div>

          <div>
            <label htmlFor="metadata-input" className="block text-sm font-semibold text-text-secondary mb-2">
              Metadata (JSON)
            </label>
            <textarea
              id="metadata-input"
              value={metadata}
              onChange={(e) => setMetadata(e.target.value)}
              className="w-full p-3 rounded-lg bg-bg-primary border border-text-secondary/10 text-text-primary focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200 font-mono text-sm"
              placeholder="{}"
              rows={4}
            />
          </div>

          <button
            onClick={handleSign}
            disabled={!selectedKey || !message}
            className="w-full py-4 px-6 rounded-lg bg-accent text-bg-primary font-semibold hover:bg-accent/90 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            <FiCheck className="w-5 h-5" />
            Sign Message
          </button>
        </div>

        {error && (
          <div className="p-4 bg-danger/10 border border-danger/20 rounded-lg text-danger text-sm mt-6">
            {error}
          </div>
        )}

        {signature && (
          <div className="mt-8 space-y-6 p-6 bg-bg-primary rounded-xl border border-text-secondary/10">
            <div>
              <h3 className="text-sm font-semibold text-text-secondary mb-2">
                Signature
              </h3>
              <div className="p-4 bg-bg-secondary rounded-lg overflow-x-auto">
                <code className="text-sm font-mono text-text-primary break-all whitespace-pre-wrap">
                  {signature.signature}
                </code>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-text-secondary mb-2">
                Signature Hash
              </h3>
              <div className="p-4 bg-bg-secondary rounded-lg overflow-x-auto">
                <code className="text-sm font-mono text-text-primary break-all whitespace-pre-wrap">
                  {signature.signatureHash}
                </code>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignMessage;


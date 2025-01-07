import { createPortal } from 'react-dom';

interface LogoutModalProps {
  onClose: () => void;
  onConfirm: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({ onClose, onConfirm }) => {
  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-bg-primary p-6 rounded-xl shadow-xl max-w-md w-full border border-text-secondary/10">
        <h3 className="text-xl font-semibold text-danger mb-2">Warning!</h3>
        <p className="text-text-primary mb-4">
          Logging out will remove all your generated keypairs from this device. 
          Make sure you have backed up any important keypairs before proceeding.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg hover:bg-bg-secondary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-danger text-white hover:bg-danger/90 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default LogoutModal; 
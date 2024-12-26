import React from "react";
import { FiCheck, FiX, FiAlertTriangle } from "react-icons/fi";

interface ApprovalRequestProps {
  action: string;
  payload: any;
  onApprove: () => void;
  onReject: () => void;
}

export const ApprovalRequest: React.FC<ApprovalRequestProps> = ({
  action,
  payload,
  onApprove,
  onReject,
}) => {
  return (
    <div className="bg-bg-primary border border-text-secondary/10 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-text-secondary/10 flex items-center">
        <FiAlertTriangle className="text-warning h-5 w-5 mr-3" />
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Approval Required</h3>
          <p className="text-sm text-text-secondary mt-1">Action: {action}</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Request Details
          </label>
          <pre className="bg-bg-secondary p-4 rounded-lg overflow-x-auto text-text-primary font-mono text-sm whitespace-pre-wrap">
            {JSON.stringify(payload, null, 2)}
          </pre>
        </div>

        {/* Warning Message */}
        <div className="mb-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
          <p className="text-sm text-warning flex items-center">
            <FiAlertTriangle className="h-4 w-4 mr-2" />
            Please review the request details carefully before approving
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onReject}
            className="px-4 py-2 bg-bg-primary border border-danger text-danger rounded-lg hover:bg-danger/10 transition-colors duration-200 flex items-center"
          >
            <FiX className="mr-2 h-4 w-4" />
            Reject
          </button>
          <button
            onClick={onApprove}
            className="px-4 py-2 bg-accent text-bg-primary rounded-lg hover:bg-accent/90 transition-colors duration-200 flex items-center"
          >
            <FiCheck className="mr-2 h-4 w-4" />
            Approve
          </button>
        </div>
      </div>
    </div>
  );
};


import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'An unexpected error occurred. Please try again.',
  onRetry
}) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-3">
      <AlertCircle className="h-8 w-8 text-[#DC2626] mx-auto" />
      <h4 className="text-sm font-bold text-[#DC2626]">Operation Failed</h4>
      <p className="text-xs text-red-700 max-w-sm mx-auto">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-[#DC2626] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-red-700 transition-colors inline-flex items-center space-x-1.5 cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Retry Action</span>
        </button>
      )}
    </div>
  );
};

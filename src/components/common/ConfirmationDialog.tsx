import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  danger = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-xl max-w-sm w-full p-5 space-y-4 animate-in fade-in zoom-in duration-150">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2.5">
            <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${danger ? 'bg-red-100 text-[#DC2626]' : 'bg-amber-100 text-[#F59E0B]'}`}>
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-[#171717]">{title}</h3>
          </div>
          <button onClick={onCancel} className="text-[#6B7280] hover:text-[#171717] p-1 cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-xs text-[#6B7280] leading-relaxed">{message}</p>

        <div className="flex gap-2.5 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 bg-[#F7F7F5] hover:bg-neutral-200 text-[#171717] font-bold text-xs rounded-xl border border-[#E5E7EB] transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer ${
              danger ? 'bg-[#DC2626] hover:bg-red-700' : 'bg-[#171717] hover:bg-neutral-800'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

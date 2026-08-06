import React, { useState } from 'react';
import { REJECT_REASONS } from '../../constants/theme';
import { X, Check } from 'lucide-react';

interface RejectReasonSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectReason: (reason: string) => void;
}

export const RejectReasonSheet: React.FC<RejectReasonSheetProps> = ({
  isOpen,
  onClose,
  onSelectReason
}) => {
  const [selectedReason, setSelectedReason] = useState(REJECT_REASONS[0]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white border border-[#E5E7EB] rounded-t-3xl sm:rounded-2xl shadow-2xl max-w-sm w-full p-5 space-y-4 animate-in slide-in-from-bottom duration-150">
        <div className="flex justify-between items-center pb-2 border-b border-[#E5E7EB]">
          <h3 className="text-base font-bold text-[#171717]">Select Rejection Reason</h3>
          <button onClick={onClose} className="p-1 text-[#6B7280] hover:text-[#171717] cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2">
          {REJECT_REASONS.map((reason) => {
            const isSelected = selectedReason === reason;
            return (
              <button
                key={reason}
                onClick={() => setSelectedReason(reason)}
                className={`w-full p-3 rounded-xl border text-xs font-bold flex justify-between items-center transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#171717] bg-[#F7F7F5] text-[#171717]'
                    : 'border-[#E5E7EB] bg-white text-[#6B7280] hover:border-neutral-300'
                }`}
              >
                <span>{reason}</span>
                {isSelected && <Check className="h-4 w-4 text-[#171717]" />}
              </button>
            );
          })}
        </div>

        <div className="flex gap-2.5 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-[#F7F7F5] hover:bg-neutral-200 text-[#171717] font-bold text-xs rounded-xl border border-[#E5E7EB] cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => onSelectReason(selectedReason)}
            className="flex-1 py-2.5 bg-[#DC2626] hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
          >
            Confirm Rejection
          </button>
        </div>
      </div>
    </div>
  );
};

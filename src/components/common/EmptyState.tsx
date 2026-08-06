import React from 'react';
import { PackageX } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction
}) => {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-3 shadow-xs">
      <div className="h-16 w-16 bg-[#F7F7F5] rounded-full flex items-center justify-center text-[#6B7280]">
        <PackageX className="h-8 w-8 text-[#6B7280]" />
      </div>
      <h3 className="text-base sm:text-lg font-bold text-[#171717]">{title}</h3>
      <p className="text-xs sm:text-sm text-[#6B7280] max-w-md leading-relaxed">{description}</p>
      {onAction && actionText && (
        <button
          onClick={onAction}
          className="mt-2 px-5 py-2.5 bg-[#171717] text-white font-bold text-xs rounded-xl shadow-xs hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

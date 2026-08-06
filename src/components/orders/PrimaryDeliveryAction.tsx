import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface PrimaryDeliveryActionProps {
  label: string;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'success';
}

export const PrimaryDeliveryAction: React.FC<PrimaryDeliveryActionProps> = ({
  label,
  onClick,
  loading = false,
  disabled = false,
  variant = 'primary'
}) => {
  const isSuccess = variant === 'success';

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`w-full py-4 px-6 rounded-2xl font-extrabold text-sm sm:text-base shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer ${
        isSuccess
          ? 'bg-[#16A34A] hover:bg-emerald-700 text-white'
          : 'bg-[#F5B800] hover:bg-[#e0a800] text-[#171717]'
      } ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'active:scale-[0.99]'}`}
    >
      {isSuccess ? <CheckCircle2 className="h-5 w-5" /> : null}
      <span>{loading ? 'Processing...' : label}</span>
      {!isSuccess && !loading && <ArrowRight className="h-5 w-5" />}
    </button>
  );
};

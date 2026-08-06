import React from 'react';
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';

interface AlertCardProps {
  type?: 'warning' | 'info' | 'success' | 'error';
  title?: string;
  message: string;
  onAction?: () => void;
  actionText?: string;
}

export const AlertCard: React.FC<AlertCardProps> = ({
  type = 'warning',
  title,
  message,
  onAction,
  actionText
}) => {
  const styles = {
    warning: {
      bg: 'bg-amber-50 border-amber-200 text-amber-900',
      icon: AlertTriangle,
      iconColor: 'text-[#F59E0B]',
      button: 'bg-[#F59E0B] text-white hover:bg-amber-600'
    },
    info: {
      bg: 'bg-blue-50 border-blue-200 text-blue-900',
      icon: Info,
      iconColor: 'text-[#2563EB]',
      button: 'bg-[#2563EB] text-white hover:bg-blue-600'
    },
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      icon: CheckCircle,
      iconColor: 'text-[#16A34A]',
      button: 'bg-[#16A34A] text-white hover:bg-emerald-600'
    },
    error: {
      bg: 'bg-red-50 border-red-200 text-red-900',
      icon: XCircle,
      iconColor: 'text-[#DC2626]',
      button: 'bg-[#DC2626] text-white hover:bg-red-600'
    }
  };

  const current = styles[type];
  const Icon = current.icon;

  return (
    <div className={`p-4 rounded-2xl border ${current.bg} shadow-xs flex items-start justify-between gap-3 text-xs sm:text-sm font-medium`}>
      <div className="flex items-start space-x-3">
        <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${current.iconColor}`} />
        <div>
          {title && <h4 className="font-bold text-[#171717] mb-0.5">{title}</h4>}
          <p className="leading-relaxed">{message}</p>
        </div>
      </div>

      {onAction && actionText && (
        <button
          onClick={onAction}
          className={`px-3 py-1.5 rounded-xl font-bold text-xs shrink-0 cursor-pointer transition-colors shadow-xs ${current.button}`}
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

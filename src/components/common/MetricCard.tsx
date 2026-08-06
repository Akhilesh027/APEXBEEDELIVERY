import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ComponentType<{ className?: string }>;
  iconBg?: string;
  iconColor?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtext,
  icon: Icon,
  iconBg = 'bg-[#F5B800]/15',
  iconColor = 'text-[#F5B800]'
}) => {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between transition-all hover:border-neutral-300">
      <div>
        <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider block">
          {label}
        </span>
        <p className="text-xl sm:text-2xl font-bold text-[#171717] mt-1 tracking-tight">{value}</p>
        {subtext && <p className="text-[11px] text-[#6B7280] font-medium mt-1">{subtext}</p>}
      </div>

      {Icon && (
        <div className={`h-11 w-11 ${iconBg} rounded-xl flex items-center justify-center shrink-0`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      )}
    </div>
  );
};

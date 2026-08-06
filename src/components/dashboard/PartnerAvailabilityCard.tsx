import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import type { PartnerAvailability } from '../../types/partner';
import { Power, Coffee, CheckCircle2, Navigation } from 'lucide-react';

export const PartnerAvailabilityCard: React.FC = () => {
  const { partner, currentOrder, setAvailability } = useAppStore();
  const isOrderActive = !!currentOrder && currentOrder.status !== 'Delivered';

  const options: Array<{
    id: PartnerAvailability;
    label: string;
    icon: any;
    activeBg: string;
    activeText: string;
    disabled?: boolean;
  }> = [
    {
      id: 'Available',
      label: 'Available',
      icon: CheckCircle2,
      activeBg: 'bg-[#16A34A] text-white shadow-sm',
      activeText: 'text-[#16A34A]',
    },
    {
      id: 'Break',
      label: 'On Break',
      icon: Coffee,
      activeBg: 'bg-[#2563EB] text-white shadow-sm',
      activeText: 'text-[#2563EB]',
      disabled: isOrderActive
    },
    {
      id: 'Offline',
      label: 'Go Offline',
      icon: Power,
      activeBg: 'bg-[#DC2626] text-white shadow-sm',
      activeText: 'text-[#DC2626]',
      disabled: isOrderActive
    }
  ];

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider block">
            Rider Duty Availability
          </span>
          <div className="flex items-center space-x-2 mt-1">
            <span
              className={`h-3 w-3 rounded-full ${
                partner.availability === 'Available'
                  ? 'bg-[#16A34A] animate-pulse'
                  : partner.availability === 'On Delivery'
                  ? 'bg-[#F59E0B] animate-pulse'
                  : partner.availability === 'Break'
                  ? 'bg-[#2563EB]'
                  : 'bg-[#DC2626]'
              }`}
            />
            <span className="text-base font-extrabold text-[#171717]">{partner.availability}</span>
          </div>
        </div>

        {partner.availability === 'On Delivery' && (
          <span className="px-3 py-1 bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30 rounded-full text-xs font-bold flex items-center space-x-1.5 animate-pulse">
            <Navigation className="h-3.5 w-3.5" />
            <span>Active Assignment</span>
          </span>
        )}
      </div>

      {isOrderActive && (
        <p className="text-xs text-[#DC2626] font-medium bg-red-50 border border-red-200 p-2.5 rounded-xl">
          ⚠️ Cannot change duty mode to Break or Offline while an active delivery order is in progress.
        </p>
      )}

      <div className="grid grid-cols-3 gap-2.5 pt-1">
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = partner.availability === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => !opt.disabled && setAvailability(opt.id)}
              disabled={opt.disabled}
              className={`py-3 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center space-y-1.5 cursor-pointer ${
                isSelected
                  ? opt.activeBg
                  : opt.disabled
                  ? 'bg-neutral-100 text-neutral-400 border border-neutral-200 cursor-not-allowed opacity-50'
                  : 'bg-[#F7F7F5] border border-[#E5E7EB] text-[#171717] hover:bg-neutral-200'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

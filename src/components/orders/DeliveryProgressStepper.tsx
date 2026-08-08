import React from 'react';
import type { DisplayDeliveryStatus } from '../../types/order';

interface DeliveryProgressStepperProps {
  currentStatus: DisplayDeliveryStatus;
  isFoodOrder?: boolean;
}

export const DeliveryProgressStepper: React.FC<DeliveryProgressStepperProps> = ({ currentStatus, isFoodOrder }) => {
  const steps: Array<{ key: DisplayDeliveryStatus[]; label: string }> = isFoodOrder ? [
    { key: ['Accepted', 'ready_for_pickup', 'Ready', 'Packed'], label: 'Food Ready' },
    { key: ['Reached Vendor', 'Pickup OTP Verified', 'Picked Up'], label: 'Picked Up' },
    { key: ['Out for Delivery', 'Reached Customer', 'Delivery OTP Verified'], label: 'On Way' },
    { key: ['Delivered', 'Completed'], label: 'Delivered' }
  ] : [
    { key: ['Accepted'], label: 'Accepted' },
    { key: ['Reached Vendor', 'Pickup OTP Verified'], label: 'Vendor' },
    { key: ['Picked Up'], label: 'Picked Up' },
    { key: ['Reached Customer', 'Delivery OTP Verified'], label: 'Customer' },
    { key: ['Delivered'], label: 'Delivered' }
  ];

  const getStepState = (index: number) => {
    let activeIndex = 0;
    if (isFoodOrder) {
      if (['Reached Vendor', 'Pickup OTP Verified', 'Picked Up', 'picked_up'].includes(currentStatus)) activeIndex = 1;
      if (['Out for Delivery', 'out_for_delivery', 'Reached Customer', 'Delivery OTP Verified', 'Shipped'].includes(currentStatus)) activeIndex = 2;
      if (['Delivered', 'Completed', 'delivered'].includes(currentStatus)) activeIndex = 3;
    } else {
      if (['Reached Vendor', 'Pickup OTP Verified'].includes(currentStatus)) activeIndex = 1;
      if (['Picked Up', 'picked_up'].includes(currentStatus)) activeIndex = 2;
      if (['Reached Customer', 'Delivery OTP Verified', 'Out for Delivery', 'out_for_delivery'].includes(currentStatus)) activeIndex = 3;
      if (['Delivered', 'Completed', 'delivered'].includes(currentStatus)) activeIndex = 4;
    }

    if (index < activeIndex) return 'completed';
    if (index === activeIndex) return 'current';
    return 'pending';
  };

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-xs">
      <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block mb-3">
        Delivery Lifecycle Progress
      </span>

      <div className="flex justify-between items-center relative">
        {/* Connection Line */}
        <div className="absolute top-3.5 left-4 right-4 h-0.5 bg-[#E5E7EB] -z-0" />

        {steps.map((step, idx) => {
          const state = getStepState(idx);
          return (
            <div key={idx} className="flex flex-col items-center relative z-10">
              <div
                className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  state === 'completed'
                    ? 'bg-[#16A34A] text-white shadow-xs'
                    : state === 'current'
                    ? 'bg-[#F5B800] text-[#171717] ring-4 ring-[#F5B800]/20 font-extrabold scale-110'
                    : 'bg-[#F7F7F5] border border-[#E5E7EB] text-[#6B7280]'
                }`}
              >
                {state === 'completed' ? '✓' : idx + 1}
              </div>
              <span
                className={`text-[10px] font-bold mt-1.5 ${
                  state === 'current'
                    ? 'text-[#171717]'
                    : state === 'completed'
                    ? 'text-[#16A34A]'
                    : 'text-[#6B7280]'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

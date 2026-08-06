import React from 'react';
import type { DisplayDeliveryStatus } from '../../types/order';

interface OrderStatusBadgeProps {
  status: DisplayDeliveryStatus;
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status }) => {
  const styles: Record<DisplayDeliveryStatus, string> = {
    Assigned: 'bg-amber-100 text-amber-900 border-amber-300',
    Accepted: 'bg-amber-100 text-amber-900 border-[#F5B800]',
    'Reached Vendor': 'bg-blue-100 text-[#2563EB] border-blue-300',
    'Pickup OTP Verified': 'bg-emerald-100 text-[#16A34A] border-emerald-300',
    'Picked Up': 'bg-amber-100 text-amber-900 border-amber-300',
    'Reached Customer': 'bg-blue-100 text-[#2563EB] border-blue-300',
    'Delivery OTP Verified': 'bg-emerald-100 text-[#16A34A] border-emerald-300',
    Delivered: 'bg-emerald-100 text-[#16A34A] border-emerald-300',
    Completed: 'bg-emerald-100 text-[#16A34A] border-emerald-300',
    Failed: 'bg-red-100 text-[#DC2626] border-red-300',
    Rejected: 'bg-neutral-100 text-neutral-600 border-neutral-300'
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-extrabold border shadow-2xs tracking-wide uppercase ${
        styles[status] || 'bg-neutral-100 text-neutral-800 border-neutral-300'
      }`}
    >
      {status}
    </span>
  );
};

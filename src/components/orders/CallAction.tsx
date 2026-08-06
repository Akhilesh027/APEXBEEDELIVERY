import React from 'react';
import { Phone } from 'lucide-react';

interface CallActionProps {
  phone: string;
  label?: string;
}

export const CallAction: React.FC<CallActionProps> = ({ phone, label = 'Call' }) => {
  return (
    <a
      href={`tel:${phone}`}
      className="py-2.5 px-4 bg-[#F7F7F5] hover:bg-neutral-200 text-[#171717] border border-[#E5E7EB] font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-2xs"
    >
      <Phone className="h-4 w-4 text-[#16A34A]" />
      <span>{label}</span>
    </a>
  );
};

import React from 'react';
import { Navigation } from 'lucide-react';

interface NavigationActionProps {
  address: string;
  label?: string;
}

export const NavigationAction: React.FC<NavigationActionProps> = ({
  address,
  label = 'Open Route Map'
}) => {
  const handleOpenMap = () => {
    const encoded = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encoded}`, '_blank');
  };

  return (
    <button
      onClick={handleOpenMap}
      className="py-2.5 px-4 bg-[#F7F7F5] hover:bg-neutral-200 text-[#171717] border border-[#E5E7EB] font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-2xs"
    >
      <Navigation className="h-4 w-4 text-[#2563EB]" />
      <span>{label}</span>
    </button>
  );
};

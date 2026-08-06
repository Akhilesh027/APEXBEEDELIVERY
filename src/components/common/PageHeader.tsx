import React from 'react';
import { Bell } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onNotificationClick?: () => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  onNotificationClick
}) => {
  const { partner, notifications } = useAppStore();
  const unreadCount = notifications.filter((n) => n.status === 'unread').length;

  return (
    <header className="bg-[#171717] text-white px-4 py-3.5 sm:px-6 md:px-8 border-b border-neutral-800 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div>
        <h1 className="text-base sm:text-lg font-bold text-white tracking-tight capitalize">{title}</h1>
        {subtitle && <p className="text-xs text-neutral-400 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Availability Badge */}
        <div className="hidden sm:flex items-center space-x-2 bg-neutral-800 px-3 py-1 rounded-full border border-neutral-700">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              partner.availability === 'Available'
                ? 'bg-[#16A34A] animate-pulse'
                : partner.availability === 'On Delivery'
                ? 'bg-[#F59E0B] animate-pulse'
                : partner.availability === 'Break'
                ? 'bg-[#2563EB]'
                : 'bg-[#DC2626]'
            }`}
          />
          <span className="text-xs font-semibold text-neutral-200">{partner.availability}</span>
        </div>

        {/* Notifications Icon */}
        <button
          onClick={onNotificationClick}
          className="relative p-2 bg-neutral-800 hover:bg-neutral-700 rounded-xl border border-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
          aria-label="View notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-[#F5B800] text-[#171717] text-[10px] font-extrabold rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Partner Profile Avatar */}
        <div className="flex items-center space-x-2 border-l border-neutral-800 pl-3">
          <div className="h-9 w-9 bg-[#F5B800] text-[#171717] font-bold text-xs rounded-xl flex items-center justify-center shadow-sm uppercase overflow-hidden">
            {partner.profileImage ? (
              <img src={partner.profileImage} alt={partner.name} className="h-full w-full object-cover" />
            ) : (
              partner.name.substring(0, 2)
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

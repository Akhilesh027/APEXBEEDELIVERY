import React from 'react';
import { NavLink, useNavigate } from '../app/simpleRouter';
import { useAppStore } from '../store/useAppStore';
import { authService } from '../services/authService';
import {
  LayoutDashboard,
  MapPin,
  Repeat,
  DollarSign,
  Wallet,
  Award,
  Clock,
  Calendar,
  Bell,
  User,
  HelpCircle,
  LogOut,
  Navigation
} from 'lucide-react';

export const DesktopSidebar: React.FC = () => {
  const { partner } = useAppStore();
  const navigate = useNavigate();

  const navItems = [
    { to: '/app/home', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/app/orders', label: 'Orders', icon: MapPin },
    { to: '/app/subscriptions', label: 'Subscriptions', icon: Repeat },
    { to: '/app/earnings', label: 'Earnings', icon: DollarSign },
    { to: '/app/wallet', label: 'Wallet', icon: Wallet },
    { to: '/app/performance', label: 'Performance', icon: Award },
    { to: '/app/attendance', label: 'Attendance', icon: Clock },
    { to: '/app/leave', label: 'Leave', icon: Calendar },
    { to: '/app/notifications', label: 'Notifications', icon: Bell },
    { to: '/app/profile', label: 'Profile', icon: User },
    { to: '/app/support', label: 'Support', icon: HelpCircle }
  ];

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <aside className="hidden md:flex w-64 bg-[#171717] text-white border-r border-neutral-800 flex-col justify-between shrink-0 select-none">
      <div className="p-5">
        {/* Brand Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="h-10 w-10 bg-[#F5B800] text-[#171717] rounded-xl flex items-center justify-center font-extrabold shadow-md">
            <Navigation className="h-5 w-5 fill-[#171717]" />
          </div>
          <div>
            <h2 className="font-extrabold text-white text-base tracking-tight">ApexBee Logistics</h2>
            <span className="text-[10px] uppercase font-extrabold text-[#F5B800] tracking-wider">
              Partner Portal
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                    isActive
                      ? 'bg-[#F5B800] text-[#171717] font-extrabold shadow-xs'
                      : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile & Logout */}
      <div className="p-4 border-t border-neutral-800 bg-neutral-900/50">
        <div className="flex items-center space-x-3 mb-3">
          <div className="h-9 w-9 bg-[#F5B800] text-[#171717] rounded-full flex items-center justify-center font-extrabold text-xs uppercase shrink-0">
            {partner.name.substring(0, 2)}
          </div>
          <div className="truncate">
            <p className="text-xs font-bold text-white truncate">{partner.name}</p>
            <p className="text-[10px] text-neutral-400 font-mono truncate">{partner.deliveryPartnerId}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 py-2 bg-neutral-800 hover:bg-red-950/40 hover:text-red-400 border border-neutral-700 hover:border-red-900 text-neutral-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

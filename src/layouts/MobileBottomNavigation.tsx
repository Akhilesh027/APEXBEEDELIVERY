import React from 'react';
import { NavLink } from '../app/simpleRouter';
import { Home, MapPin, DollarSign, Award, User } from 'lucide-react';

export const MobileBottomNavigation: React.FC = () => {
  const items = [
    { to: '/app/home', label: 'Home', icon: Home },
    { to: '/app/orders', label: 'Orders', icon: MapPin },
    { to: '/app/earnings', label: 'Earnings', icon: DollarSign },
    { to: '/app/performance', label: 'Performance', icon: Award },
    { to: '/app/profile', label: 'Profile', icon: User }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#171717] border-t border-neutral-800 flex justify-around items-center h-16 px-1 shadow-2xl">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full py-1 cursor-pointer transition-all ${
                isActive
                  ? 'text-[#F5B800] font-extrabold scale-105'
                  : 'text-[#6B7280] hover:text-neutral-300 font-medium'
              }`
            }
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

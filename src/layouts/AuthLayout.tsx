import React from 'react';
import { Outlet } from '../app/simpleRouter';
import { Navigation } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#171717] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-[#E5E7EB] rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col items-center text-center">
          <div className="h-14 w-14 bg-[#F5B800] rounded-2xl flex items-center justify-center shadow-lg mb-3">
            <Navigation className="h-7 w-7 text-[#171717]" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#171717] tracking-tight">ApexBee Logistics</h1>
          <p className="text-xs text-[#6B7280] font-semibold mt-0.5">Delivery Partner Operating Portal</p>
        </div>

        <Outlet />
      </div>
    </div>
  );
};

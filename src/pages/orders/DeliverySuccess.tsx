import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { CheckCircle2, Award, ArrowLeft, Clock, ShoppingBag } from 'lucide-react';
import { useNavigate } from '../../app/simpleRouter';

export const DeliverySuccessPage: React.FC = () => {
  const { currentOrder, completedCountToday } = useAppStore();
  const navigate = useNavigate();

  const orderNum = currentOrder?.orderNumber || 'AB-ORD-10245';

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 sm:p-10 text-center space-y-6 max-w-lg mx-auto shadow-md animate-in zoom-in duration-200">
      {/* Icon Badge */}
      <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-[#16A34A] ring-8 ring-emerald-50">
        <CheckCircle2 className="h-10 w-10 text-[#16A34A]" />
      </div>

      <div>
        <span className="text-xs font-bold text-[#16A34A] uppercase tracking-wider block">
          Task Completed Successfully
        </span>
        <h2 className="text-2xl font-extrabold text-[#171717] mt-1">Delivery Successful!</h2>
        <p className="text-xs text-[#6B7280] font-medium mt-1">Order #{orderNum} has been handed over.</p>
      </div>

      {/* Summary Box */}
      <div className="bg-[#F7F7F5] border border-[#E5E7EB] rounded-2xl p-4 sm:p-5 grid grid-cols-2 gap-4 text-xs">
        <div className="space-y-1 text-left border-r border-[#E5E7EB] pr-3">
          <span className="text-[#6B7280] font-semibold flex items-center space-x-1">
            <Clock className="h-3.5 w-3.5 text-[#2563EB]" />
            <span>Completion Time</span>
          </span>
          <p className="text-base font-extrabold text-[#171717]">22 mins</p>
        </div>

        <div className="space-y-1 text-left pl-1">
          <span className="text-[#6B7280] font-semibold flex items-center space-x-1">
            <Award className="h-3.5 w-3.5 text-[#F59E0B]" />
            <span>Incentive Earned</span>
          </span>
          <p className="text-base font-extrabold text-[#16A34A] font-mono">+₹30.00</p>
        </div>
      </div>

      {/* Daily Progress Stats */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex justify-between items-center text-xs font-bold text-[#16A34A]">
        <span>Completed Deliveries Today:</span>
        <span className="text-base font-extrabold">{completedCountToday} Orders</span>
      </div>

      {/* Navigation Actions */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={() => navigate('/app/orders')}
          className="flex-1 py-3 bg-[#F7F7F5] hover:bg-neutral-200 text-[#171717] font-bold text-xs sm:text-sm rounded-xl border border-[#E5E7EB] transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
        >
          <ShoppingBag className="h-4 w-4" />
          <span>View Orders Log</span>
        </button>
        <button
          onClick={() => navigate('/app/home')}
          className="flex-1 py-3 bg-[#171717] hover:bg-neutral-800 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </button>
      </div>
    </div>
  );
};

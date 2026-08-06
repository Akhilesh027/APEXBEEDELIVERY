import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { MapPin, ArrowRight, Package } from 'lucide-react';
import { useNavigate } from '../../app/simpleRouter';

export const ActiveDeliveryCard: React.FC = () => {
  const { currentOrder } = useAppStore();
  const navigate = useNavigate();

  if (!currentOrder || currentOrder.status === 'Delivered') return null;

  return (
    <div className="bg-[#171717] text-white rounded-2xl p-5 shadow-md border border-neutral-800 space-y-4">
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-2.5">
          <div className="h-10 w-10 bg-[#F5B800] text-[#171717] rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#F5B800] uppercase tracking-wider block">
              Active Delivery Task
            </span>
            <h4 className="text-base font-extrabold text-white">{currentOrder.orderNumber}</h4>
          </div>
        </div>

        <span className="px-3 py-1 bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40 rounded-full text-xs font-extrabold animate-pulse">
          {currentOrder.status}
        </span>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5 space-y-2.5 text-xs">
        <div className="flex justify-between items-center text-neutral-300">
          <span className="font-semibold text-neutral-400">Pickup Merchant:</span>
          <span className="font-bold text-white truncate max-w-[200px]">{currentOrder.vendor.name}</span>
        </div>
        <div className="flex justify-between items-center text-neutral-300">
          <span className="font-semibold text-neutral-400">Customer Destination:</span>
          <span className="font-bold text-white truncate max-w-[200px]">{currentOrder.customer.name}</span>
        </div>
        <div className="flex justify-between items-center border-t border-neutral-800 pt-2 text-[11px]">
          <span className="text-[#F5B800] font-bold flex items-center space-x-1">
            <MapPin className="h-3.5 w-3.5" />
            <span>Total Route: {currentOrder.customer.deliveryDistanceKm} km</span>
          </span>
          <span className="text-neutral-400 font-semibold">Est. {currentOrder.estimatedTotalTimeMins} mins</span>
        </div>
      </div>

      <button
        onClick={() => navigate(`/app/orders/active/${currentOrder.orderId}`)}
        className="w-full py-3 bg-[#F5B800] hover:bg-[#e0a800] text-[#171717] font-extrabold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
      >
        <span>Continue Delivery Task</span>
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
};

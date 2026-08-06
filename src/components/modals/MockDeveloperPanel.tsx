import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { initialMockOffer } from '../../mocks/mockOrders';
import { Settings, RefreshCw, X, ShieldCheck, Clock } from 'lucide-react';

export const MockDeveloperPanel: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [minimized, setMinimized] = useState(false);

  const {
    partner,
    setAvailability,
    setOffer,
    setOfferCountdown,
    resetMockState
  } = useAppStore();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('mockTools') === 'true') {
        setVisible(true);
      }
    }
  }, []);

  if (!visible) return null;

  const handleApprovePartner = () => {
    const updated = { ...partner, status: 'active' as const };
    useAppStore.setState({ partner: updated });
    localStorage.setItem('delivery_partner', JSON.stringify(updated));
    const registered = JSON.parse(localStorage.getItem('apexbee_registered_partners_db') || '[]');
    const matchIdx = registered.findIndex((p: any) => p.mobile === partner.mobile);
    if (matchIdx >= 0) {
      registered[matchIdx].status = 'active';
      localStorage.setItem('apexbee_registered_partners_db', JSON.stringify(registered));
    }
    alert(`Partner ${partner.name} (${partner.deliveryPartnerId}) status set to Approved (active)!`);
  };

  const handleSetPendingPartner = () => {
    const updated = { ...partner, status: 'pending_approval' as const };
    useAppStore.setState({ partner: updated });
    localStorage.setItem('delivery_partner', JSON.stringify(updated));
    const registered = JSON.parse(localStorage.getItem('apexbee_registered_partners_db') || '[]');
    const matchIdx = registered.findIndex((p: any) => p.mobile === partner.mobile);
    if (matchIdx >= 0) {
      registered[matchIdx].status = 'pending_approval';
      localStorage.setItem('apexbee_registered_partners_db', JSON.stringify(registered));
    }
    alert(`Partner ${partner.name} status set to Pending Admin Verification!`);
  };

  return (
    <div className="fixed bottom-20 right-4 z-50 animate-in slide-in-from-bottom duration-200 select-none">
      {minimized ? (
        <button
          onClick={() => setMinimized(false)}
          className="bg-[#171717] text-[#F5B800] p-3 rounded-full shadow-2xl border-2 border-[#F5B800] flex items-center space-x-2 font-bold text-xs cursor-pointer"
        >
          <Settings className="h-4 w-4 animate-spin" />
          <span>Mock Tools</span>
        </button>
      ) : (
        <div className="bg-[#171717] text-white border-2 border-[#F5B800] rounded-2xl p-4 shadow-2xl w-80 space-y-3.5 text-xs">
          <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
            <div className="flex items-center space-x-2">
              <Settings className="h-4 w-4 text-[#F5B800]" />
              <h4 className="font-extrabold text-white">Admin & Mock Tools</h4>
            </div>
            <div className="flex items-center space-x-1">
              <button onClick={() => setMinimized(true)} className="text-neutral-400 hover:text-white p-1">
                _
              </button>
              <button onClick={() => setVisible(false)} className="text-neutral-400 hover:text-white p-1">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Admin Verification Controls */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-[#6B7280] uppercase block">
                Admin Verification Status
              </span>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${partner.status === 'active' ? 'bg-emerald-900 text-emerald-300' : 'bg-amber-900 text-amber-300'}`}>
                {partner.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={handleApprovePartner}
                className="py-1.5 bg-[#16A34A] text-white font-bold rounded-lg text-[10px] flex items-center justify-center space-x-1"
              >
                <ShieldCheck className="h-3 w-3" />
                <span>Admin Approve</span>
              </button>
              <button
                onClick={handleSetPendingPartner}
                className="py-1.5 bg-amber-600 text-white font-bold rounded-lg text-[10px] flex items-center justify-center space-x-1"
              >
                <Clock className="h-3 w-3" />
                <span>Set Pending</span>
              </button>
            </div>
          </div>

          <div className="space-y-2 border-t border-neutral-800 pt-2">
            <span className="text-[10px] font-bold text-[#6B7280] uppercase block">
              Duty Status Override
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => setAvailability('Available')}
                className="py-1.5 bg-[#16A34A] text-white font-bold rounded-lg text-[10px]"
              >
                Available
              </button>
              <button
                onClick={() => setAvailability('Break')}
                className="py-1.5 bg-[#2563EB] text-white font-bold rounded-lg text-[10px]"
              >
                On Break
              </button>
              <button
                onClick={() => setAvailability('Offline')}
                className="py-1.5 bg-[#DC2626] text-white font-bold rounded-lg text-[10px]"
              >
                Offline
              </button>
            </div>
          </div>

          <div className="space-y-2 border-t border-neutral-800 pt-2">
            <span className="text-[10px] font-bold text-[#6B7280] uppercase block">
              Order Offer Trigger
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => setOffer(initialMockOffer)}
                className="py-2 bg-[#F5B800] text-[#171717] font-bold rounded-lg text-[10px]"
              >
                Trigger Offer
              </button>
              <button
                onClick={() => setOfferCountdown(0)}
                className="py-2 bg-neutral-800 text-neutral-300 font-bold rounded-lg text-[10px]"
              >
                Expire Offer
              </button>
            </div>
          </div>

          <div className="border-t border-neutral-800 pt-2">
            <button
              onClick={resetMockState}
              className="w-full py-2 bg-red-950 text-red-300 border border-red-800 font-bold rounded-lg text-[10px] flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Reset State & LocalStorage</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

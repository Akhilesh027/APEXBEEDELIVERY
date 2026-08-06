import React, { useEffect } from 'react';
import { Outlet, useNavigate } from '../app/simpleRouter';
import { DesktopSidebar } from './DesktopSidebar';
import { MobileBottomNavigation } from './MobileBottomNavigation';
import { OrderOfferSheet } from '../components/orders/OrderOfferSheet';
import { useAppStore } from '../store/useAppStore';
import { orderService } from '../services/orderService';
import { useLiveLocation } from '../hooks/useLiveLocation';
import { ArrowRight, Navigation } from 'lucide-react';

export const AppShell: React.FC = () => {
  const liveLocation = useLiveLocation();
  const { currentOrder } = useAppStore();
  const navigate = useNavigate();

  // Live order assignment polling from backend MongoDB
  useEffect(() => {
    let isMounted = true;

    const checkNewAssignedOrders = async () => {
      if (!isMounted) return;
      const currentActive = useAppStore.getState().currentOrder;
      const currentPendingOffer = useAppStore.getState().activeOffer;

      // If rider is already delivering or reviewing an offer, don't interrupt
      if (currentActive || currentPendingOffer) return;

      try {
        const offer = await orderService.getCurrentOffer();
        if (isMounted) {
          useAppStore.setState({
            activeOffer: offer,
            offerCountdown: offer ? offer.expiresInSeconds || 30 : 0
          });
        }
      } catch (err) {
        console.error('Error checking new assigned orders:', err);
      }
    };

    checkNewAssignedOrders();
    const interval = setInterval(checkNewAssignedOrders, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const isDeliveryActive = !!currentOrder && currentOrder.status !== 'Delivered';

  return (
    <div className="min-h-screen flex bg-[#F7F7F5] text-[#171717] font-sans antialiased">
      {/* Desktop Sidebar */}
      <DesktopSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-6 relative">
        {/* Persistent Active Order & GPS Bar */}
        <div className="sticky top-0 z-40 space-y-0 font-sans">
          {/* Live GPS Tracking Header Status */}
          <div className="bg-[#171717] text-white border-b border-neutral-800 px-4 py-1.5 sm:px-6 flex items-center justify-between text-[11px]">
            <div className="flex items-center space-x-2">
              <span className={`h-2 w-2 rounded-full ${liveLocation.isGpsActive ? 'bg-[#16A34A] animate-pulse' : 'bg-amber-400'}`} />
              <span className="font-bold text-neutral-300 flex items-center space-x-1">
                <Navigation className="h-3 w-3 text-[#F5B800]" />
                <span>
                  {liveLocation.isGpsActive
                    ? `Live GPS Active (${liveLocation.latitude?.toFixed(4)}° N, ${liveLocation.longitude?.toFixed(4)}° E)`
                    : 'GPS Tracking Active (LB Nagar Zone)'}
                </span>
              </span>
            </div>
            <span className="text-neutral-400 text-[10px] hidden sm:inline">Real-time Location Sync</span>
          </div>

          {isDeliveryActive && (
            <div className="bg-neutral-900 text-white px-4 py-2.5 sm:px-6 flex items-center justify-between shadow-md border-b border-neutral-800">
              <div className="flex items-center space-x-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B] animate-pulse" />
                <span className="text-xs font-extrabold text-white">
                  Active Order: <span className="text-[#F5B800]">{currentOrder.orderNumber}</span> ({currentOrder.status})
                </span>
              </div>
              <button
                onClick={() => navigate(`/app/orders/active/${currentOrder.orderId}`)}
                className="px-3 py-1 bg-[#F5B800] hover:bg-[#e0a800] text-[#171717] font-extrabold text-xs rounded-lg transition-colors flex items-center space-x-1 cursor-pointer"
              >
                <span>Resume Task</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Page Content Outlet */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8 space-y-6">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNavigation />

        {/* Global Order Offer Notification Sheet */}
        <OrderOfferSheet />
      </div>
    </div>
  );
};

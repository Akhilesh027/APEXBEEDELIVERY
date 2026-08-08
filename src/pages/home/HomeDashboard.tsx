import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { partnerService } from '../../services/partnerService';
import { apiClient } from '../../services/apiClient';
import { orderService } from '../../services/orderService';
import { PageHeader } from '../../components/common/PageHeader';
import { MetricCard } from '../../components/common/MetricCard';
import { ShiftCard } from '../../components/dashboard/ShiftCard';
import { ActiveDeliveryCard } from '../../components/dashboard/ActiveDeliveryCard';
import { Package, IndianRupee, Clock, Award, TrendingUp, MapPin, CheckCircle2, XCircle } from 'lucide-react';

export const HomeDashboard: React.FC = () => {
  const {
    partner,
    completedCountToday,
    incentivesEarnedToday,
    currentOrder,
    activeOffer,
    orderHistory
  } = useAppStore();
  const todayEarnings = orderHistory.reduce((sum, o) => sum + (o.estimatedEarnings || 0), 0);
  const deliveriesCompletedToday = completedCountToday || orderHistory.length;

  const [broadcastOrders, setBroadcastOrders] = useState<any[]>([]);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [morningSubscriptions, setMorningSubscriptions] = useState<any[]>([]);

  useEffect(() => {
    partnerService.getCurrentPartner().catch(() => {});
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const res = await apiClient.get('/subscriptions');
      const subs = res.data?.subscriptions || [];
      setMorningSubscriptions(subs);
    } catch (err) {}
  };

  const fetchBroadcasts = async () => {
    try {
      const res = await apiClient.get('/orders');
      const assignments = res.data?.assignments || [];
      const pending = assignments.filter(
        (a: any) => a.status === 'Assigned' || a.status === 'Pending' || a.status === 'pending'
      );
      setBroadcastOrders(pending);
    } catch (err) {}
  };

  useEffect(() => {
    fetchBroadcasts();
    fetchSubscriptions();
    const interval = setInterval(() => {
      fetchBroadcasts();
      fetchSubscriptions();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const isCheckedIn = Boolean(partner?.isClockedIn || partner?.availability === 'Available' || partner?.availability === 'Online');
  const dutyStartTimestamp = partner?.dutyStartTimestamp;
  const [elapsedSec, setElapsedSec] = useState(0);

  useEffect(() => {
    let interval: any = null;
    if (isCheckedIn && dutyStartTimestamp) {
      const updateTimer = () => {
        const now = Date.now();
        const diff = Math.floor((now - dutyStartTimestamp) / 1000);
        setElapsedSec(diff > 0 ? diff : 0);
      };
      updateTimer();
      interval = setInterval(updateTimer, 1000);
    } else {
      setElapsedSec(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCheckedIn, dutyStartTimestamp]);

  const hours = Math.floor(elapsedSec / 3600);
  const minutes = Math.floor((elapsedSec % 3600) / 60);
  const liveOnlineTime = isCheckedIn ? `${hours}h ${minutes}m` : '0h 00m';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const partnerFirstName = partner?.name ? partner.name.split(' ')[0] : 'Rider';
  const partnerId = partner?.deliveryPartnerId || 'AB-DP-000125';
  const partnerZone = partner?.zone || 'LB Nagar';
  const acceptanceRate = partner?.performance?.acceptanceRate ?? 100;
  const safeDeliveries = deliveriesCompletedToday ?? 0;
  const safeEarnings = todayEarnings ?? 0;
  const safeIncentives = incentivesEarnedToday ?? 0;

  return (
    <div className="space-y-6">
      {/* Top Welcome Header */}
      <PageHeader
        title={`${getGreeting()}, ${partnerFirstName}`}
        subtitle={`Partner ID: ${partnerId} • Zone: ${partnerZone}`}
      />

      {/* Primary Shift Control Widget */}
      <ShiftCard />

      {/* MORNING SUBSCRIPTION DELIVERY ALARM & RUN WIDGET */}
      {morningSubscriptions.length > 0 && (
        <div className="bg-[#FEF08A] text-slate-950 p-5 rounded-2xl border-2 border-[#F5B800] shadow-lg space-y-4 font-sans text-left">
          <div className="flex items-center justify-between border-b border-slate-900/20 pb-3">
            <div className="flex items-center space-x-2">
              <span className="h-3 w-3 rounded-full bg-rose-600 animate-ping" />
              <span className="px-2.5 py-1 bg-slate-950 text-amber-400 rounded-md font-black text-xs uppercase tracking-wider">
                ⏰ 05:30 AM MORNING RUN ALARM
              </span>
            </div>
            <span className="text-xs font-black text-slate-900 bg-white/80 px-2.5 py-1 rounded-lg border border-slate-900/10">
              Shift Slot: {morningSubscriptions[0].deliverySlot || '06:00 AM - 07:00 AM'}
            </span>
          </div>

          {morningSubscriptions.map((sub: any) => {
            const subId = sub._id || sub.id;
            const currentStatus = sub.status || sub.runStatus || 'active';
            const isDelivered = currentStatus === 'Delivered';
            const isOut = currentStatus === 'Out for Delivery';

            return (
              <div key={subId} className="bg-white text-slate-900 p-4 rounded-xl shadow-md border border-slate-200 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded text-[10px] font-black uppercase border border-amber-300">
                      {sub.frequency || 'Alternate Days'} Run #{subId.slice(-6)}
                    </span>
                    <h4 className="font-black text-base text-[#171717] mt-1">{sub.productName}</h4>
                    <p className="text-xs font-bold text-slate-500">Qty: {sub.quantity || 1} Pkt/Item</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase text-white ${isDelivered ? 'bg-emerald-600' : isOut ? 'bg-blue-600' : 'bg-slate-900'}`}>
                    {currentStatus}
                  </span>
                </div>

                {/* Addresses */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div>
                    <p className="text-[10px] font-black uppercase text-blue-600 flex items-center gap-1">
                      <span>Pickup Location</span>
                    </p>
                    <p className="font-black text-slate-900 mt-0.5">{sub.pickupStoreName || 'cdcd'}</p>
                    <p className="text-slate-600 text-[11px]">{sub.pickupAddress || 'dcdc, tamsi, Telangana - 504312'}</p>
                    <div className="flex gap-2 mt-2">
                      <a href={`tel:${sub.pickupPhone || '9848012345'}`} className="px-2.5 py-1 bg-blue-100 text-blue-800 font-bold rounded-lg text-[10px] border border-blue-200">📞 Call Vendor</a>
                      <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(sub.pickupAddress || 'tamsi, Telangana')}`} target="_blank" rel="noreferrer" className="px-2.5 py-1 bg-blue-600 text-white font-bold rounded-lg text-[10px]">Store Directions</a>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-black uppercase text-emerald-600 flex items-center gap-1">
                      <span>Delivery Dropoff Address</span>
                    </p>
                    <p className="font-black text-slate-900 mt-0.5">{sub.customerName || 'PALODI GAMEING'}</p>
                    <p className="text-slate-600 text-[11px]">{sub.address || sub.deliveryAddress || 'Tamsi Mandal, Adilabad, Telangana, 504312, India'}</p>
                    <div className="flex gap-2 mt-2">
                      <a href={`tel:${sub.customerPhone || '9550379505'}`} className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg text-[10px] border border-emerald-200">📞 Call Customer</a>
                      <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(sub.address || 'Tamsi Mandal, Adilabad')}`} target="_blank" rel="noreferrer" className="px-2.5 py-1 bg-emerald-600 text-white font-bold rounded-lg text-[10px]">Dropoff Directions</a>
                    </div>
                  </div>
                </div>

                {/* Roster Timeline Strip */}
                <div className="pt-1">
                  <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Weekly Subscription Roster Status:</p>
                  <div className="flex gap-2 text-[11px] font-bold overflow-x-auto pb-1">
                    <span className="bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-md border border-emerald-200 shrink-0">08-06: Delivered</span>
                    <span className="bg-amber-100 text-amber-900 px-2.5 py-1 rounded-md border border-amber-300 font-black shrink-0">08-08: {currentStatus}</span>
                    <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200 shrink-0">08-10: Scheduled</span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-600 mt-1">Status for 2026-08-08: <span className="font-black text-slate-950 uppercase">{currentStatus}</span></p>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200 justify-between items-center">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(sub.pickupAddress || 'tamsi, Telangana')}&destination=${encodeURIComponent(sub.address || 'Tamsi Mandal, Adilabad')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-black border border-slate-300 transition"
                  >
                    🗺️ Full Route Directions
                  </a>

                  <div className="flex gap-2">
                    {!isOut && !isDelivered && (
                      <button
                        onClick={async () => {
                          try {
                            await apiClient.post(`/subscriptions/${subId}/status`, { status: 'Out for Delivery' });
                            fetchSubscriptions();
                          } catch (e) {}
                        }}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl border-none cursor-pointer shadow-xs transition"
                      >
                        Start Delivery Run 🚚
                      </button>
                    )}

                    {!isDelivered && (
                      <button
                        onClick={async () => {
                          try {
                            await apiClient.post(`/subscriptions/${subId}/status`, { status: 'Delivered' });
                            fetchSubscriptions();
                          } catch (e) {}
                        }}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl border-none cursor-pointer shadow-xs transition"
                      >
                        Mark Delivered ✅
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Active Delivery Progress Card (if order exists) */}
      {currentOrder && <ActiveDeliveryCard />}

      {/* Available Broadcast Delivery Requests Feed */}
      {!currentOrder && broadcastOrders.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-[#171717] flex items-center space-x-2">
              <span className="h-3 w-3 rounded-full bg-[#F59E0B] animate-ping" />
              <span>Available Delivery Broadcasts ({broadcastOrders.length})</span>
            </h3>
            <span className="text-[11px] font-semibold text-[#6B7280]">Real-time Nearby Pool</span>
          </div>

          <div className="space-y-3">
            {broadcastOrders.map((bOrder: any, index: number) => {
              const bOrdObj = typeof bOrder.orderId === 'object' ? bOrder.orderId : null;
              const bOrdId = bOrdObj?._id || bOrder.orderId || bOrder._id;
              const bOrderNum = bOrdObj?.orderNumber || bOrder.orderNumber || `AB-ORD-${index + 101}`;
              const vName = bOrder.vendorId?.businessName || bOrder.vendorId?.ownerName || bOrder.vendorId?.name || 'GNS Stores';
              const vAddr = bOrder.vendorId?.address || bOrder.vendorId?.storeAddress || 'NH67, బుచ్చిరెడ్డిపాలెం, Sri Potti Sriramulu Nellore';
              const cName = bOrdObj?.shippingAddress?.recipientName || bOrdObj?.shippingAddress?.name || bOrder.customerId?.name || 'Customer';
              const cAddr = bOrdObj?.shippingAddress
                ? `${bOrdObj.shippingAddress.addressLine1 || bOrdObj.shippingAddress.address || ''}, ${bOrdObj.shippingAddress.city || ''}`
                : bOrder.customerId?.address || 'Palodi, Adilabad, Telangana';
              const bEarnings = bOrdObj?.orderSummary?.shippingFee || Math.max(68, Math.round(35 + (index + 1) * 12));

              return (
                <div key={bOrdId} className="bg-white border-2 border-[#F5B800] p-4 sm:p-5 rounded-2xl shadow-md space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[11px] font-bold text-[#F59E0B] uppercase tracking-wider block">
                        #{bOrderNum}
                      </span>
                      <h4 className="font-extrabold text-[#171717] text-base mt-0.5">{vName}</h4>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[#6B7280] font-bold block uppercase">Estimated Pay</span>
                      <span className="text-lg font-extrabold text-[#16A34A] font-mono">₹{Number(bEarnings).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="bg-[#F7F7F5] border border-[#E5E7EB] rounded-xl p-3 space-y-2 text-xs">
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-3.5 w-3.5 text-[#16A34A] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-[#171717]">Pickup:</span> {vAddr}
                      </div>
                    </div>
                    <div className="border-t border-[#E5E7EB] pt-1.5 flex items-start space-x-2">
                      <MapPin className="h-3.5 w-3.5 text-[#F59E0B] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-[#171717]">Dropoff ({cName}):</span> {cAddr}
                      </div>
                    </div>
                  </div>

                  <div className="pt-1 flex gap-3">
                    <button
                      onClick={async () => {
                        try {
                          await apiClient.post(`/orders/${bOrdId}/reject`, { reason: 'Skipped by driver' });
                        } catch (e) {}
                        fetchBroadcasts();
                      }}
                      className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center space-x-1"
                    >
                      <XCircle className="h-3.5 w-3.5 text-neutral-500" />
                      <span>Reject / Pass</span>
                    </button>
                    <button
                      disabled={acceptingId === bOrdId}
                      onClick={async () => {
                        setAcceptingId(bOrdId);
                        try {
                          await apiClient.post(`/orders/${bOrdId}/accept`);
                          window.location.href = `/app/orders/active/${bOrdId}`;
                        } catch (err) {
                          alert('Failed to accept order offer');
                        } finally {
                          setAcceptingId(null);
                        }
                      }}
                      className="flex-1 py-2.5 bg-[#F5B800] hover:bg-[#e0a800] text-[#171717] font-black text-xs rounded-xl shadow-md transition cursor-pointer flex items-center justify-center space-x-1"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#171717]" />
                      <span>{acceptingId === bOrdId ? 'Accepting...' : 'Accept Order Dispatch'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Status / Guidance Banner */}
      {!currentOrder && !activeOffer && isCheckedIn && (
        <div className="bg-[#FEF9C3] border border-[#FDE047] p-4 rounded-2xl flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="font-bold text-[#854D0E] text-sm block">You are On Duty &amp; Available</span>
            <p className="text-xs text-[#6B7280]">Stay online to receive new delivery assignments in {partnerZone}.</p>
          </div>
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16A34A] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#16A34A]"></span>
          </span>
        </div>
      )}

      {/* Key Metrics Overview Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <MetricCard
          label="Today's Earnings"
          value={`₹${safeEarnings}`}
          subtext={`${safeDeliveries} orders completed`}
          icon={IndianRupee}
          iconBg="bg-emerald-100"
          iconColor="text-[#16A34A]"
        />
        <MetricCard
          label="Deliveries"
          value={safeDeliveries.toString()}
          subtext="Target: 10 orders"
          icon={Package}
          iconBg="bg-amber-100"
          iconColor="text-[#F5B800]"
        />
        <MetricCard
          label="Incentives"
          value={`₹${safeIncentives}`}
          subtext="Tier bonus earnings"
          icon={Award}
          iconBg="bg-amber-100"
          iconColor="text-[#F59E0B]"
        />
        <MetricCard
          label="Online Time"
          value={liveOnlineTime}
          subtext={isCheckedIn ? 'Active shift duration' : 'Off duty'}
          icon={Clock}
          iconBg="bg-blue-100"
          iconColor="text-[#2563EB]"
        />
        <MetricCard
          label="Acceptance Rate"
          value={`${acceptanceRate}%`}
          subtext="Order completion score"
          icon={TrendingUp}
          iconBg="bg-neutral-100"
          iconColor="text-[#171717]"
        />
      </div>
    </div>
  );
};

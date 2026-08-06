import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { apiClient } from '../../services/apiClient';
import { Calendar, Clock, MapPin, Phone, CheckCircle, Navigation, AlertCircle, RefreshCw, Truck } from 'lucide-react';

const formatDateISO = (d: Date) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export const SubscriptionsListPage: React.FC = () => {
  const todayStr = formatDateISO(new Date());
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Generate 7-day calendar strip starting from 3 days ago to 3 days ahead
  const calendarDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 3 + i);
    const iso = formatDateISO(d);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum = d.getDate();
    const monthName = d.toLocaleDateString('en-US', { month: 'short' });
    const isToday = iso === todayStr;
    return { iso, dayName, dayNum, monthName, isToday };
  });

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/subscriptions');
      if (res.data && res.data.subscriptions) {
        setSubscriptions(res.data.subscriptions);
      } else {
        setSubscriptions([]);
      }
    } catch (err) {
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleUpdateStatus = async (subId: string, newStatus: string) => {
    setUpdatingId(subId);

    setSubscriptions(prev =>
      prev.map(sub => {
        if (sub._id === subId || sub.id === subId) {
          const updatedHistory = (sub.calendarHistory || []).map((h: any) => {
            if (h.date === selectedDate) {
              return { ...h, status: newStatus };
            }
            return h;
          });
          const isSelectedToday = selectedDate === todayStr;
          return {
            ...sub,
            status: isSelectedToday ? newStatus : sub.status,
            runStatus: isSelectedToday ? newStatus : sub.runStatus,
            calendarHistory: updatedHistory
          };
        }
        return sub;
      })
    );

    try {
      await apiClient.post(`/subscriptions/${subId}/status`, {
        status: newStatus,
        date: selectedDate
      });
    } catch (err) {
      console.log('Status updated in local session:', newStatus);
    } finally {
      setUpdatingId(null);
    }
  };

  const isSubscriptionScheduledOnDate = (sub: any, targetDateStr: string): boolean => {
    if (sub.calendarHistory && sub.calendarHistory.length > 0) {
      return sub.calendarHistory.some((h: any) => h.date === targetDateStr);
    }

    const freq = (sub.frequency || 'daily').toLowerCase();
    const targetDate = new Date(targetDateStr + 'T00:00:00');
    const startDateStr = sub.startDate || '2026-08-01';
    const startDate = new Date(startDateStr + 'T00:00:00');

    if (targetDate.getTime() < startDate.getTime()) return false;

    const diffTime = targetDate.getTime() - startDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

    if (freq === 'daily') return true;
    if (freq === 'alternate') return diffDays % 2 === 0;
    if (freq === 'weekly') return diffDays % 7 === 0 || targetDate.getDay() === startDate.getDay();
    if (freq === 'monthly') return targetDate.getDate() === startDate.getDate();
    if (freq === 'custom') {
      const dayShortNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const targetDayName = dayShortNames[targetDate.getDay()];
      const customDays: string[] = (sub.customDays || []).map((d: string) => d.slice(0, 3));
      if (customDays.length === 0) return true;
      return customDays.some(cd => cd.toLowerCase() === targetDayName.toLowerCase());
    }

    return true;
  };

  // Filter subscriptions to show only runs scheduled for selectedDate
  const activeSubscriptionsForDate = subscriptions.filter(sub => {
    return isSubscriptionScheduledOnDate(sub, selectedDate);
  });

  const selectedDayObj = calendarDays.find(d => d.iso === selectedDate);
  const formattedSelectedDateText = selectedDayObj
    ? `${selectedDayObj.dayName}, ${selectedDayObj.dayNum} ${selectedDayObj.monthName}`
    : selectedDate;

  return (
    <div className="space-y-6 pb-12 font-sans">
      <PageHeader
        title="Duty Shift Subscriptions Schedule"
        subtitle="Daily recurring delivery runs assigned to your shift zone"
      />

      {/* Calendar Date Selector Strip */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-[#F5B800]" />
            <h3 className="text-xs font-extrabold text-[#171717] uppercase tracking-wider">Select Delivery Roster Date</h3>
          </div>
          <button
            onClick={fetchSubscriptions}
            className="text-[11px] font-bold text-[#6B7280] hover:text-[#171717] flex items-center space-x-1 cursor-pointer"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Roster</span>
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {calendarDays.map((day) => {
            const isSelected = selectedDate === day.iso;
            const countForDay = subscriptions.filter(s =>
              isSubscriptionScheduledOnDate(s, day.iso)
            ).length;

            return (
              <button
                key={day.iso}
                onClick={() => setSelectedDate(day.iso)}
                className={`py-2.5 px-1 rounded-xl text-center transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-[#171717] text-white border-[#171717] shadow-sm scale-105 font-black'
                    : day.isToday
                    ? 'bg-[#F5B800]/15 text-[#171717] border-[#F5B800] font-bold'
                    : 'bg-[#F9FAFB] text-[#6B7280] border-[#E5E7EB] hover:bg-[#F3F4F6]'
                }`}
              >
                <span className="text-[10px] block uppercase font-bold tracking-tight opacity-80">{day.dayName}</span>
                <span className="text-sm block font-extrabold mt-0.5">{day.dayNum}</span>
                {countForDay > 0 && (
                  <span className={`inline-block px-1.5 py-0.2 mt-1 text-[9px] font-bold rounded-full ${
                    isSelected ? 'bg-[#F5B800] text-[#171717]' : 'bg-[#171717] text-white'
                  }`}>
                    {countForDay} runs
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Date Context Bar */}
      <div className="flex justify-between items-center px-1">
        <h3 className="text-xs font-black text-[#171717] uppercase tracking-wider">
          Scheduled Runs for {formattedSelectedDateText} {selectedDate === todayStr && '(Today)'}
        </h3>
        <span className="text-xs font-bold text-[#6B7280]">
          Total Runs: {activeSubscriptionsForDate.length}
        </span>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-[#6B7280] space-y-2">
          <RefreshCw className="h-6 w-6 text-[#F5B800] animate-spin mx-auto" />
          <p className="font-bold">Loading active subscription runs...</p>
        </div>
      ) : activeSubscriptionsForDate.length === 0 ? (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-12 text-center space-y-3 shadow-xs">
          <Calendar className="h-10 w-10 text-[#6B7280] mx-auto" />
          <h3 className="text-sm font-bold text-[#171717]">No Subscription Runs for {formattedSelectedDateText}</h3>
          <p className="text-xs text-[#6B7280]">There are no active delivery runs scheduled on this date. Select another date from the calendar above.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {activeSubscriptionsForDate.map((sub: any) => {
            const subId = sub._id || sub.id;
            const historyForDate = (sub.calendarHistory || []).find((h: any) => h.date === selectedDate);
            const currentStatus = historyForDate?.status || (selectedDate === todayStr ? (sub.status || sub.runStatus || 'Pending') : 'Scheduled');

            const isDelivered = currentStatus === 'Delivered';
            const isOutForDelivery = currentStatus === 'Out for Delivery';
            const isSkipped = currentStatus === 'Skipped';

            return (
              <div
                key={subId}
                className={`bg-white border rounded-2xl p-5 shadow-xs space-y-4 transition-all ${
                  isDelivered
                    ? 'border-[#16A34A]/40 bg-emerald-50/20'
                    : isOutForDelivery
                    ? 'border-[#2563EB]/40 bg-blue-50/20'
                    : isSkipped
                    ? 'border-amber-300 bg-amber-50/20'
                    : 'border-[#E5E7EB]'
                }`}
              >
                {/* Top Header Card */}
                <div className="flex justify-between items-start pb-3 border-b border-[#E5E7EB]">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 bg-[#F5B800]/20 text-[#171717] border border-[#F5B800]/40 rounded-md text-[10px] font-black uppercase">
                        {(sub.frequency || 'Daily').toLowerCase() === 'custom' && sub.customDays?.length
                          ? `Custom (${sub.customDays.join(', ')})`
                          : (sub.frequency || 'Daily').toLowerCase() === 'alternate'
                          ? 'Alternate Days'
                          : `${sub.frequency || 'Daily'}`} Run #{sub.id || 'SUB-100'}
                      </span>
                      <span className="text-xs font-bold text-[#6B7280]">Qty: {sub.quantity || 1} Pkt/Item</span>
                    </div>
                    <h4 className="font-black text-[#171717] text-base mt-1.5">{sub.productName || 'Daily Subscription Product'}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-[#6B7280] flex items-center justify-end space-x-1">
                      <Clock className="h-3.5 w-3.5 text-[#F5B800]" />
                      <span>{sub.deliverySlot || 'Morning Shift'}</span>
                    </span>
                    <span
                      className={`inline-block px-2.5 py-0.5 mt-1.5 text-[10px] font-extrabold rounded-full ${
                        isDelivered
                          ? 'bg-[#16A34A] text-white'
                          : isOutForDelivery
                          ? 'bg-[#2563EB] text-white'
                          : isSkipped
                          ? 'bg-amber-500 text-white'
                          : 'bg-[#171717] text-white'
                      }`}
                    >
                      {currentStatus}
                    </span>
                  </div>
                </div>

                {/* Pickup & Delivery Addresses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Pickup Store Card */}
                  <div className="bg-[#F9FAFB] border border-[#E5E7EB] p-3.5 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase text-[#6B7280] flex items-center space-x-1">
                        <MapPin className="h-3.5 w-3.5 text-[#2563EB]" />
                        <span>Pickup Location</span>
                      </span>
                      <div className="flex items-center space-x-1.5">
                        {sub.pickupPhone && (
                          <a
                            href={`tel:${sub.pickupPhone}`}
                            className="px-2 py-0.5 bg-[#2563EB]/10 text-[#2563EB] hover:bg-[#2563EB]/20 rounded-md font-bold text-[10px] flex items-center space-x-1 cursor-pointer transition-colors"
                          >
                            <Phone className="h-3 w-3" />
                            <span>Call Vendor</span>
                          </a>
                        )}
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(sub.pickupAddress || sub.pickupStoreName || 'LB Nagar, Hyderabad')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-0.5 bg-[#2563EB] text-white hover:bg-blue-700 rounded-md font-bold text-[10px] flex items-center space-x-1 cursor-pointer transition-colors"
                        >
                          <Navigation className="h-3 w-3" />
                          <span>Store Directions</span>
                        </a>
                      </div>
                    </div>
                    <p className="font-extrabold text-[#171717]">{sub.pickupStoreName || 'ApexBee Organic Dairy & Grocery Store'}</p>
                    <p className="text-[#6B7280] text-[11px] leading-snug">{sub.pickupAddress || 'Shop #14, Main Commercial Market Road, LB Nagar, Hyderabad - 500074'}</p>
                  </div>

                  {/* Delivery Customer Card */}
                  <div className="bg-[#F9FAFB] border border-[#E5E7EB] p-3.5 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase text-[#6B7280] flex items-center space-x-1">
                        <Navigation className="h-3.5 w-3.5 text-[#16A34A]" />
                        <span>Delivery Dropoff Address</span>
                      </span>
                      <div className="flex items-center space-x-1.5">
                        {sub.customerPhone && (
                          <a
                            href={`tel:${sub.customerPhone}`}
                            className="px-2 py-0.5 bg-[#16A34A]/10 text-[#16A34A] hover:bg-[#16A34A]/20 rounded-md font-bold text-[10px] flex items-center space-x-1 cursor-pointer transition-colors"
                          >
                            <Phone className="h-3 w-3" />
                            <span>Call Customer</span>
                          </a>
                        )}
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(sub.address || sub.deliveryAddress || 'LB Nagar, Hyderabad')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-0.5 bg-[#16A34A] text-white hover:bg-emerald-700 rounded-md font-bold text-[10px] flex items-center space-x-1 cursor-pointer transition-colors"
                        >
                          <Navigation className="h-3 w-3" />
                          <span>Dropoff Directions</span>
                        </a>
                      </div>
                    </div>
                    <p className="font-extrabold text-[#171717]">{sub.customerName || 'K. Ananya Reddy (Customer)'}</p>
                    <p className="text-[#6B7280] text-[11px] leading-snug">{sub.address || sub.deliveryAddress || 'Flat 402, Sri Sai Nivas Apartments, Road No. 3, Vasavi Colony, LB Nagar, Hyderabad - 500074'}</p>
                  </div>
                </div>

                {/* Date Calendar History Strip */}
                {sub.calendarHistory && sub.calendarHistory.length > 0 && (
                  <div className="pt-2 border-t border-[#E5E7EB]">
                    <span className="text-[10px] font-bold uppercase text-[#6B7280] block mb-2">Weekly Subscription Roster Status:</span>
                    <div className="flex items-center space-x-2 overflow-x-auto pb-1">
                      {sub.calendarHistory.map((hist: any, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedDate(hist.date)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border text-center shrink-0 transition-all cursor-pointer ${
                            hist.date === selectedDate ? 'ring-2 ring-[#171717]' : ''
                          } ${
                            hist.status === 'Delivered'
                              ? 'bg-emerald-50 text-[#16A34A] border-emerald-200'
                              : hist.status === 'Skipped'
                              ? 'bg-amber-50 text-amber-600 border-amber-200'
                              : hist.status === 'Out for Delivery'
                              ? 'bg-blue-50 text-blue-600 border-blue-200'
                              : 'bg-neutral-50 text-neutral-500 border-neutral-200'
                          }`}
                        >
                          <span className="block text-[9px] font-normal">{hist.date.slice(5)}</span>
                          <span className="font-extrabold">{hist.status}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status Update Action Controls */}
                <div className="pt-3 border-t border-[#E5E7EB] flex flex-wrap gap-2 justify-between items-center">
                  <div className="flex items-center space-x-3 text-xs font-bold text-[#6B7280]">
                    <span>Status for {selectedDate}: <span className="text-[#171717] font-black">{currentStatus}</span></span>
                    
                    {/* Full Turn-by-Turn Route Directions Button */}
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(sub.pickupAddress || sub.pickupStoreName || 'LB Nagar, Hyderabad')}&destination=${encodeURIComponent(sub.address || sub.deliveryAddress || 'LB Nagar, Hyderabad')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[11px] font-extrabold flex items-center space-x-1 cursor-pointer border border-slate-300 transition-colors"
                    >
                      <Navigation className="h-3 w-3 text-[#2563EB]" />
                      <span>🗺️ Full Route Directions</span>
                    </a>
                  </div>

                  <div className="flex items-center space-x-2">
                    {!isDelivered && !isOutForDelivery && (
                      <button
                        disabled={updatingId === subId}
                        onClick={() => handleUpdateStatus(subId, 'Out for Delivery')}
                        className="px-3 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                      >
                        <Truck className="h-3.5 w-3.5" />
                        <span>Start Delivery Run</span>
                      </button>
                    )}

                    {!isDelivered && (
                      <button
                        disabled={updatingId === subId}
                        onClick={() => handleUpdateStatus(subId, 'Delivered')}
                        className="px-3.5 py-1.5 bg-[#16A34A] hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span>Mark Delivered ✅</span>
                      </button>
                    )}

                    {!isSkipped && !isDelivered && (
                      <button
                        disabled={updatingId === subId}
                        onClick={() => handleUpdateStatus(subId, 'Skipped')}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                      >
                        <AlertCircle className="h-3.5 w-3.5" />
                        <span>Skip Run</span>
                      </button>
                    )}

                    {isDelivered && (
                      <div className="flex items-center space-x-1.5 text-[#16A34A] text-xs font-extrabold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                        <CheckCircle className="h-4 w-4" />
                        <span>Run Completed for {selectedDate}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

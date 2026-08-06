import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { partnerService } from '../../services/partnerService';
import { PageHeader } from '../../components/common/PageHeader';
import { MetricCard } from '../../components/common/MetricCard';
import { ShiftCard } from '../../components/dashboard/ShiftCard';
import { ActiveDeliveryCard } from '../../components/dashboard/ActiveDeliveryCard';
import { Package, IndianRupee, Clock, Award, TrendingUp } from 'lucide-react';

export const HomeDashboard: React.FC = () => {
  const {
    partner,
    completedCountToday,
    incentivesEarnedToday,
    currentOrder,
    orderHistory
  } = useAppStore();
  const todayEarnings = orderHistory.reduce((sum, o) => sum + (o.estimatedEarnings || 0), 0);
  const deliveriesCompletedToday = completedCountToday || orderHistory.length;

  useEffect(() => {
    partnerService.getCurrentPartner().catch(() => {});
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

      {/* Active Delivery Progress Card (if order exists) */}
      {currentOrder && <ActiveDeliveryCard />}

      {/* Quick Status / Guidance Banner */}
      {!currentOrder && isCheckedIn && (
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

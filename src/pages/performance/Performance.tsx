import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { useAppStore } from '../../store/useAppStore';
import { Star, ThumbsUp } from 'lucide-react';

export const PerformancePage: React.FC = () => {
  const { partner } = useAppStore();

  const customerRating = partner?.ratings?.customerRating ?? partner?.customerRating ?? 5.0;
  const vendorRating = partner?.ratings?.vendorRating ?? partner?.vendorRating ?? 5.0;
  const acceptanceRate = partner?.performance?.acceptanceRate ?? 100;
  const onTimeRate = partner?.performance?.onTimeRate ?? 100;

  return (
    <div className="space-y-6">
      <PageHeader title="Rider Performance & Rating" subtitle="Customer ratings, vendor ratings and SLA compliance score" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-[#6B7280] uppercase block">Customer Rating</span>
          <p className="text-2xl font-extrabold text-[#F59E0B] mt-1 flex items-center space-x-1">
            <span>{customerRating}</span>
            <Star className="h-5 w-5 fill-[#F59E0B] text-[#F59E0B]" />
          </p>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-[#6B7280] uppercase block">Vendor Rating</span>
          <p className="text-2xl font-extrabold text-[#171717] mt-1 flex items-center space-x-1">
            <span>{vendorRating}</span>
            <ThumbsUp className="h-5 w-5 text-[#2563EB]" />
          </p>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-[#6B7280] uppercase block">Acceptance Rate</span>
          <p className="text-2xl font-extrabold text-[#16A34A] mt-1">{acceptanceRate}%</p>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-[#6B7280] uppercase block">On-Time Rate</span>
          <p className="text-2xl font-extrabold text-[#16A34A] mt-1">{onTimeRate}%</p>
        </div>
      </div>
    </div>
  );
};

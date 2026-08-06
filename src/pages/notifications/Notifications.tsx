import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { notificationService } from '../../services/notificationService';
import type { NotificationItem } from '../../types';
import { Check, BellOff } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const [list, setList] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    notificationService.getNotifications().then(setList).finally(() => setLoading(false));
  }, []);

  const handleMarkAll = async () => {
    await notificationService.markAllAsRead();
    setList((prev) => prev.map((n) => ({ ...n, status: 'read' })));
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Alerts & System Notifications" subtitle="Rider updates and operational alerts" />

      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-extrabold text-[#171717] uppercase tracking-wider">All Notifications</h3>
          {list.length > 0 && (
            <button
              onClick={handleMarkAll}
              className="text-xs font-bold text-[#2563EB] hover:underline cursor-pointer flex items-center space-x-1"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Mark All Read</span>
            </button>
          )}
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-[#6B7280]">
            Loading notifications...
          </div>
        ) : list.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <BellOff className="h-8 w-8 text-[#6B7280] mx-auto" />
            <h4 className="text-xs font-bold text-[#171717]">No System Notifications</h4>
            <p className="text-xs text-[#6B7280]">You have read all notifications.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {list.map((item) => (
              <div
                key={item._id}
                className={`p-4 rounded-xl border transition-all ${
                  item.status === 'unread'
                    ? 'bg-amber-50/50 border-amber-200 text-[#171717]'
                    : 'bg-[#F7F7F5] border-[#E5E7EB] text-[#6B7280]'
                }`}
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-extrabold text-[#171717] text-sm">{item.title}</h4>
                  {item.status === 'unread' && <span className="h-2 w-2 bg-[#F59E0B] rounded-full animate-ping" />}
                </div>
                <p className="text-xs mt-1 leading-relaxed">{item.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

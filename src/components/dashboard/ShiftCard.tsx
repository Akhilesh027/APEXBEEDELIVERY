import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Coffee, Play, Calendar, Power } from 'lucide-react';
import { Link } from '../../app/simpleRouter';

export const ShiftCard: React.FC = () => {
  const { partner, toggleBreak, setClockOut } = useAppStore();

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
  const seconds = elapsedSec % 60;
  const workedHoursDisplay = isCheckedIn
    ? `${hours}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`
    : '0h 00m';

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider block">
            Shift Schedule &amp; Roster
          </span>
          <h3 className="text-base font-bold text-[#171717] mt-0.5">{partner.shift || 'Morning Shift'}</h3>
          <p className="text-xs text-[#6B7280] font-medium mt-0.5">Assigned Zone: {partner.zone || 'LB Nagar'}</p>
        </div>

        <Link
          to="/app/attendance"
          className="text-xs font-bold text-[#2563EB] hover:underline flex items-center space-x-1"
        >
          <Calendar className="h-3.5 w-3.5" />
          <span>View Duty Timing</span>
        </Link>
      </div>

      <div className="bg-[#F7F7F5] border border-[#E5E7EB] rounded-xl p-3.5 flex justify-between items-center text-xs">
        <div>
          <span className="text-[#6B7280] font-semibold block">Clocked In</span>
          <span className="font-extrabold text-[#171717]">
            {isCheckedIn ? (partner.clockedInAt || 'Active Online') : 'Not Checked In'}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[#6B7280] font-semibold block">Active Duration</span>
          <span className={`font-extrabold font-mono text-sm ${isCheckedIn ? 'text-[#16A34A]' : 'text-neutral-500'}`}>
            {workedHoursDisplay}
          </span>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        {isCheckedIn ? (
          <>
            <button
              onClick={toggleBreak}
              className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer border ${
                partner.onBreak || partner.availability === 'Break'
                  ? 'bg-[#F5B800] text-[#171717] border-[#F5B800]'
                  : 'bg-[#F7F7F5] border-[#E5E7EB] text-[#171717] hover:bg-neutral-200'
              }`}
            >
              <Coffee className="h-4 w-4" />
              <span>{partner.onBreak || partner.availability === 'Break' ? 'Resume Duty' : 'Take Break'}</span>
            </button>
            <button
              onClick={setClockOut}
              className="py-2.5 px-4 bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center space-x-1.5"
            >
              <Power className="h-4 w-4" />
              <span>End Duty</span>
            </button>
          </>
        ) : (
          <Link
            to="/app/attendance"
            className="w-full py-3 bg-[#16A34A] hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Play className="h-4 w-4 fill-white" />
            <span>Check-In &amp; Scan to Start Shift</span>
          </Link>
        )}
      </div>
    </div>
  );
};

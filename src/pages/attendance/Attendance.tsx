import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { useAppStore } from '../../store/useAppStore';
import {
  Camera,
  QrCode,
  CheckCircle2,
  Power,
  UserCheck,
  ShieldCheck,
  X
} from 'lucide-react';

interface ShiftSession {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  durationFormatted: string;
}

export const AttendancePage: React.FC = () => {
  const { partner, updatePartner } = useAppStore();

  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState<'idle' | 'scanning' | 'verified'>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [completedShiftSummary, setCompletedShiftSummary] = useState<ShiftSession | null>(null);

  const isCheckedIn = Boolean(partner?.isClockedIn || partner?.availability === 'Available' || partner?.availability === 'Online');
  const dutyStartTimestamp = partner?.dutyStartTimestamp || null;

  // Live Duty Timer (counts up every second when checked in)
  useEffect(() => {
    let interval: any = null;
    if (isCheckedIn && dutyStartTimestamp) {
      interval = setInterval(() => {
        const now = Date.now();
        const diffInSec = Math.floor((now - dutyStartTimestamp) / 1000);
        setElapsedSeconds(diffInSec > 0 ? diffInSec : 0);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCheckedIn, dutyStartTimestamp]);

  // Format Elapsed Time
  const formatTime = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    return `${hours.toString().padStart(2, '0')}h : ${minutes.toString().padStart(2, '0')}m : ${seconds.toString().padStart(2, '0')}s`;
  };

  const formatDurationText = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    if (hours > 0) return `${hours} Hour${hours > 1 ? 's' : ''} ${minutes} Minute${minutes !== 1 ? 's' : ''}`;
    return `${minutes} Minute${minutes !== 1 ? 's' : ''}`;
  };

  // Open Scanner Modal
  const openCheckInScanner = () => {
    setIsScanning(true);
    setScanStep('scanning');
    // Auto-simulate scan completion after 2 seconds
    setTimeout(() => {
      setScanStep('verified');
    }, 2000);
  };

  // Confirm Check-In after Scan
  const confirmCheckIn = () => {
    const nowTimestamp = Date.now();
    const startTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    updatePartner({
      isClockedIn: true,
      availability: 'Available',
      status: 'active',
      dutyStartTimestamp: nowTimestamp,
      clockedInAt: startTimeStr
    });

    setIsScanning(false);
    setScanStep('idle');
  };

  // Complete Shift / Check-Out & Calculate Exact Timing
  const handleCompleteShift = () => {
    if (!confirm('Are you sure you want to complete your shift session and check out?')) return;

    const nowTimestamp = Date.now();
    const endTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const totalSec = dutyStartTimestamp ? Math.floor((nowTimestamp - dutyStartTimestamp) / 1000) : 0;
    const durationText = formatDurationText(totalSec);

    const newSession: ShiftSession = {
      id: `shift_${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      startTime: partner?.clockedInAt || '06:00 AM',
      endTime: endTimeStr,
      durationFormatted: durationText
    };

    const existingSessions: any[] = partner?.completedSessions || [];

    updatePartner({
      isClockedIn: false,
      availability: 'Offline',
      status: 'offline',
      dutyStartTimestamp: undefined,
      clockedInAt: undefined,
      completedSessions: [newSession, ...existingSessions]
    });

    setCompletedShiftSummary(newSession);
  };

  const completedSessionsList: ShiftSession[] = (partner?.completedSessions || []) as ShiftSession[];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Duty Shift & Timing Tracker"
        subtitle="Check-in with QR scan, track active duty timing, and log completed shifts"
      />

      {/* Shift Completed Summary Toast / Banner */}
      {completedShiftSummary && (
        <div className="p-5 bg-gradient-to-r from-emerald-950 to-neutral-900 border border-emerald-500/50 text-white rounded-2xl shadow-xl space-y-2 animate-fadeIn">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-[#16A34A]" />
              <h4 className="font-extrabold text-sm text-emerald-400">Shift Session Completed!</h4>
            </div>
            <button
              onClick={() => setCompletedShiftSummary(null)}
              className="text-neutral-400 hover:text-white text-xs p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="text-xs text-neutral-300 space-y-1 pt-1">
            <p>Date: <strong className="text-white">{completedShiftSummary.date}</strong> ({completedShiftSummary.startTime} to {completedShiftSummary.endTime})</p>
            <p className="text-sm font-extrabold text-[#F5B800]">Total Duration Worked: {completedShiftSummary.durationFormatted}</p>
          </div>
        </div>
      )}

      {/* Main Duty Control Hero Box */}
      <div className="bg-gradient-to-br from-[#171717] to-neutral-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-neutral-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className={`h-3 w-3 rounded-full ${isCheckedIn ? 'bg-[#16A34A] animate-pulse' : 'bg-rose-500'}`} />
              <span className="text-xs font-extrabold text-[#F5B800] uppercase tracking-wider">
                {isCheckedIn ? 'Duty Status: Active Online ✅' : 'Duty Status: Off Duty 🔴'}
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-white">
              {isCheckedIn ? 'Active Shift Timing Running' : 'Ready to Start Shift?'}
            </h2>
            <p className="text-xs text-neutral-400">
              {isCheckedIn
                ? `Check-In verified at ${partner?.clockedInAt || '06:00 AM'} • Assigned Zone: ${partner?.zone || 'LB Nagar'}`
                : 'Click Check-In below to scan QR code / selfie ID and start duty.'}
            </p>
          </div>

          <div>
            {isCheckedIn ? (
              <span className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-extrabold rounded-xl flex items-center space-x-1.5">
                <UserCheck className="h-4 w-4" />
                <span>Checked In</span>
              </span>
            ) : (
              <span className="px-4 py-2 bg-neutral-800 border border-neutral-700 text-neutral-400 text-xs font-extrabold rounded-xl">
                Offline
              </span>
            )}
          </div>
        </div>

        {/* Live Timer or Check-In Action Button */}
        {isCheckedIn ? (
          <div className="space-y-6">
            {/* Real-Time Duty Stopwatch Timer */}
            <div className="bg-black/50 border border-neutral-800 rounded-2xl p-6 text-center space-y-2">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest block">
                Elapsed Shift Duty Duration
              </span>
              <p className="text-4xl sm:text-5xl font-extrabold text-[#F5B800] font-mono tracking-wider">
                {formatTime(elapsedSeconds)}
              </p>
              <span className="text-xs text-emerald-400 font-bold block pt-1">
                Currently tracking active delivery hours
              </span>
            </div>

            {/* Check Out / Complete Shift Button */}
            <div className="flex justify-center">
              <button
                onClick={handleCompleteShift}
                className="w-full sm:w-auto px-8 py-4 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm sm:text-base rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center space-x-2.5"
              >
                <Power className="h-5 w-5" />
                <span>Complete Shift &amp; Check Out</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="py-4 space-y-6">
            <div className="flex justify-center">
              <button
                onClick={openCheckInScanner}
                className="w-full sm:w-auto px-10 py-5 bg-[#16A34A] hover:bg-emerald-600 text-white font-extrabold text-base sm:text-lg rounded-2xl shadow-xl transition-all cursor-pointer flex items-center justify-center space-x-3 group"
              >
                <QrCode className="h-6 w-6 text-[#F5B800] group-hover:scale-110 transition-transform" />
                <span>Check-In &amp; Scan to Start Duty</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Completed Shift Sessions Log */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex justify-between items-center border-b border-[#E5E7EB] pb-3.5">
          <div>
            <h3 className="text-base font-extrabold text-[#171717]">Completed Shift Log</h3>
            <p className="text-xs text-[#6B7280]">Calculated exact duty timing and duration records</p>
          </div>
          <span className="text-xs font-bold text-[#2563EB]">
            {completedSessionsList.length} Sessions Recorded
          </span>
        </div>

        <div className="divide-y divide-[#E5E7EB] text-xs">
          {completedSessionsList.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#6B7280]">
              No completed shift sessions logged yet. Click &apos;Check-In &amp; Scan to Start Duty&apos; above to log your first shift session!
            </div>
          ) : (
            completedSessionsList.map((session) => (
              <div key={session.id} className="py-3.5 flex justify-between items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-[#171717]">{session.date}</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Completed
                    </span>
                  </div>
                  <span className="text-[#6B7280] block text-[11px]">
                    Shift: {session.startTime} to {session.endTime}
                  </span>
                </div>

                <div className="text-right">
                  <span className="font-extrabold text-[#171717] text-sm font-mono block">
                    {session.durationFormatted}
                  </span>
                  <span className="text-[10px] text-[#16A34A] font-bold block">Exact Timing Logged</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* QR Code / Face Scanner Modal */}
      {isScanning && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-6 text-center animate-fadeIn relative">
            <button
              onClick={() => setIsScanning(false)}
              className="absolute right-4 top-4 text-[#6B7280] hover:text-[#171717] p-1 rounded-lg transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1 pt-2">
              <h3 className="text-lg font-extrabold text-[#171717]">Duty Check-In Verification</h3>
              <p className="text-xs text-[#6B7280]">Scan Rider QR Code or Face Selfie to verify check-in</p>
            </div>

            {/* Scanner Viewport */}
            <div className="relative w-64 h-64 mx-auto bg-black rounded-2xl border-4 border-[#F5B800] overflow-hidden flex flex-col items-center justify-center space-y-3 shadow-inner">
              {scanStep === 'scanning' ? (
                <>
                  {/* Scanning Animation Line */}
                  <div className="absolute inset-x-0 h-1 bg-[#F5B800] shadow-[0_0_15px_#F5B800] animate-pulse top-1/2 -translate-y-1/2" />
                  <Camera className="h-12 w-12 text-[#F5B800] animate-bounce" />
                  <span className="text-xs font-bold text-white bg-black/60 px-3 py-1 rounded-full">
                    Scanning QR Code...
                  </span>
                </>
              ) : (
                <div className="space-y-2 p-4 text-center">
                  <ShieldCheck className="h-14 w-14 text-[#16A34A] mx-auto animate-pulse" />
                  <span className="text-sm font-extrabold text-white block">Verification Successful!</span>
                  <span className="text-[11px] text-neutral-300 block">Rider ID &amp; Location Verified</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div>
              {scanStep === 'scanning' ? (
                <p className="text-xs text-[#6B7280] font-semibold animate-pulse">
                  Align your QR code or face within the frame...
                </p>
              ) : (
                <button
                  onClick={confirmCheckIn}
                  className="w-full py-3.5 bg-[#16A34A] hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2"
                >
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Start Duty Shift Now</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

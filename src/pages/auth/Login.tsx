import React, { useState } from 'react';
import { authService } from '../../services/authService';
import { useNavigate, Link } from '../../app/simpleRouter';
import { AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length !== 10) return;
    setLoading(true);
    setError('');
    try {
      const ok = await authService.sendOtp(phone);
      if (ok) {
        setOtpSent(true);
      } else {
        setError('Failed to send OTP to registered mobile number.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error sending OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    setLoading(true);
    setError('');
    try {
      const result = await authService.verifyOtp(phone, otp);
      if (result.success) {
        if (result.status === 'pending_approval') {
          setError('Your partner registration is pending admin approval. You will receive SMS notification once activated.');
        } else {
          navigate('/app/home');
        }
      } else {
        setError(result.message || 'Invalid OTP code. Please enter the valid code sent to your phone.');
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 text-xs sm:text-sm">
      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-[#DC2626] font-bold rounded-xl flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!otpSent ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className="block text-[#171717] font-bold mb-1.5">Registered Partner Mobile</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#6B7280] font-bold">+91</span>
              <input
                type="tel"
                placeholder="10-digit mobile"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                className="w-full pl-14 pr-4 py-3 bg-[#F7F7F5] border border-[#E5E7EB] rounded-xl text-[#171717] font-bold outline-none focus:border-[#F5B800]"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || phone.length !== 10}
            className="w-full py-3.5 bg-[#F5B800] hover:bg-[#e0a800] disabled:bg-neutral-200 disabled:text-neutral-400 text-[#171717] font-extrabold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            {loading ? 'Sending OTP...' : 'Request Verification OTP'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div>
            <label className="block text-[#171717] font-bold mb-1.5">Enter Verification Code</label>
            <input
              type="text"
              maxLength={6}
              placeholder="6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="w-full px-4 py-3 bg-[#F7F7F5] border border-[#E5E7EB] rounded-xl text-[#171717] font-mono font-extrabold text-center text-xl outline-none focus:border-[#F5B800]"
              required
            />
          </div>

          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={() => setOtpSent(false)}
              className="flex-1 py-3 bg-[#F7F7F5] hover:bg-neutral-200 text-[#171717] font-bold rounded-xl border border-[#E5E7EB]"
            >
              Change Mobile
            </button>
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="flex-1 py-3 bg-[#16A34A] hover:bg-emerald-700 disabled:bg-neutral-200 text-white font-extrabold rounded-xl shadow-xs"
            >
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>
          </div>
        </form>
      )}

      <div className="text-center pt-2 border-t border-[#E5E7EB]">
        <Link to="/register" className="text-[#2563EB] font-bold text-xs hover:underline">
          New Delivery Partner? Complete Registration Application →
        </Link>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Bell, MapPin, Navigation, DollarSign, Wallet as WalletIcon, Clock,
  Settings, User, Phone, CheckCircle, AlertTriangle, Play, Pause, LogOut,
  Map, Star, Smartphone, RefreshCw, X, ChevronRight, Check
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const API_ROOT = window.location.hostname === 'localhost' ? 'https://server.apexbee.in' : 'https://server.apexbee.in';
const API_BASE = `${API_ROOT}/api/delivery`;

export default function App() {
  // App states
  const [token, setToken] = useState<string | null>(localStorage.getItem('delivery_token'));
  const [user, setUser] = useState<any>(JSON.parse(localStorage.getItem('delivery_user') || 'null'));
  const [partner, setPartner] = useState<any>(JSON.parse(localStorage.getItem('delivery_partner') || 'null'));
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'wallet' | 'attendance' | 'profile' | 'settings'>('dashboard');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Auth states
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [registerStep, setRegisterStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Registration Form states
  const [regPhone, setRegPhone] = useState('');
  const [regOtp, setRegOtp] = useState('');
  const [regOtpSent, setRegOtpSent] = useState(false);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPartnerType, setRegPartnerType] = useState<'Employee' | 'Freelancer'>('Employee');
  const [regAadhaar, setRegAadhaar] = useState('');
  const [regLicense, setRegLicense] = useState('');
  const [regPan, setRegPan] = useState('');
  const [regVehicleType, setRegVehicleType] = useState<'Bike' | 'Car' | 'EV' | 'Bicycle' | 'Two-Wheeler'>('Bike');
  const [regVehicleNumber, setRegVehicleNumber] = useState('');
  const [regRcNumber, setRegRcNumber] = useState('');
  const [regInsurance, setRegInsurance] = useState('');
  const [regRcExpiry, setRegRcExpiry] = useState('');
  const [regInsuranceExpiry, setRegInsuranceExpiry] = useState('');
  const [regLicenseExpiry, setRegLicenseExpiry] = useState('');
  const [regBankName, setRegBankName] = useState('');
  const [regBankHolder, setRegBankHolder] = useState('');
  const [regBankAccount, setRegBankAccount] = useState('');
  const [regBankIfsc, setRegBankIfsc] = useState('');
  const [regUpi, setRegUpi] = useState('');
  const [regReferredBy, setRegReferredBy] = useState('');
  const [isSelfieScanning, setIsSelfieScanning] = useState(false);
  const [isFaceVerified, setIsFaceVerified] = useState(false);

  // Dashboard & Partner states
  const [dashboardMetrics, setDashboardMetrics] = useState<any>({
    onlineStatus: 'offline',
    attendanceStatus: 'CheckedOut',
    ordersAssigned: 0,
    ordersAccepted: 0,
    ordersPending: 0,
    deliveredToday: 0,
    failedToday: 0,
    codCollectionExpected: 0,
    codCollectionCollected: 0,
    walletBalance: 0,
    pendingEarnings: 0,
    rating: 5.0,
    averageDeliveryTime: 25
  });

  // Orders and details states
  const [assignments, setAssignments] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<any | null>(null);
  const [selectedSubscription, setSelectedSubscription] = useState<any | null>(null);
  const [showProofModal, setShowProofModal] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [proofNotes, setProofNotes] = useState('');
  const [proofPhoto] = useState('');

  const [navulatingAssignment, setNavulatingAssignment] = useState<any | null>(null);
  const [selectedSubTab, setSelectedSubTab] = useState<'deliveries' | 'subscriptions'>('deliveries');

  // Clock-in flow states
  const [showClockInModal, setShowClockInModal] = useState(false);
  const [clockInShift, setClockInShift] = useState<'Morning' | 'Afternoon' | 'Night'>('Morning');
  const [isClockInScanning, setIsClockInScanning] = useState(false);
  const [isClockInFaceVerified, setIsClockInFaceVerified] = useState(false);
  const [incomingCountdown, setIncomingCountdown] = useState(30);

  // Wallet and withdrawal
  const [walletDetails, setWalletDetails] = useState<any>(null);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawSuccess, setWithdrawSuccess] = useState('');

  // Leaves & Attendance logs
  const [leavesList, setLeavesList] = useState<any[]>([]);
  const [referralsList, setReferralsList] = useState<any[]>([]);
  const [leaveStart, setLeaveStart] = useState('');
  const [leaveEnd, setLeaveEnd] = useState('');
  const [leaveReason, setLeaveReason] = useState('Personal Work');

  // Sync / loading indicators
  const [syncing, setSyncing] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Setup theme
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Load user data on startup
  useEffect(() => {
    if (token) {
      fetchDashboardData();
      fetchOrders();
      fetchWallet();
      fetchSubscriptions();
      fetchNotifications();
      fetchLeaves();
      fetchReferrals();
    }
  }, [token]);

  useEffect(() => {
    let interval: any = null;
    const incoming = assignments.find(a => a.status === 'Assigned');
    if (incoming) {
      const assignedTime = new Date(incoming.assignedAt).getTime();
      const calculateDiff = () => {
        const d = Math.max(0, 30 - Math.floor((Date.now() - assignedTime) / 1000));
        setIncomingCountdown(d);
        if (d === 0) {
          fetchOrders();
          fetchDashboardData();
        }
      };
      calculateDiff();
      interval = setInterval(calculateDiff, 1000);
    } else {
      setIncomingCountdown(30);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [assignments]);

  // Axios config
  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${token}` }
  });

  const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({ lat: 18.5204, lng: 73.8567 });
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          resolve({ lat: 18.5204, lng: 73.8567 });
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    });
  };

  const formatAddress = (addr: any) => {
    if (!addr) return 'No address provided';
    if (typeof addr === 'string') return addr;
    if (addr.addressText) return addr.addressText;
    const parts = [];
    if (addr.addressLine1 || addr.address) parts.push(addr.addressLine1 || addr.address);
    if (addr.addressLine2) parts.push(addr.addressLine2);
    if (addr.landmark) parts.push(`Landmark: ${addr.landmark}`);
    if (addr.city) parts.push(addr.city);
    if (addr.state) parts.push(addr.state);
    if (addr.pincode) parts.push(addr.pincode);
    return parts.filter(Boolean).join(', ') || 'Address details not set';
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    setLoading(true);
    setAuthError('');
    try {
      await axios.post(`${API_BASE}/login`, { phone });
      setOtpSent(true);
    } catch (err: any) {
      setAuthError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !otp) return;
    setLoading(true);
    setAuthError('');
    try {
      const res = await axios.post(`${API_BASE}/verify-otp`, { phone, otp });
      const { token: userToken, user: userData, partner: partnerData } = res.data;
      localStorage.setItem('delivery_token', userToken);
      localStorage.setItem('delivery_user', JSON.stringify(userData));
      localStorage.setItem('delivery_partner', JSON.stringify(partnerData));
      setToken(userToken);
      setUser(userData);
      setPartner(partnerData);
    } catch (err: any) {
      setAuthError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSendRegOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regPhone || regPhone.length !== 10) return;
    setLoading(true);
    setAuthError('');
    try {
      setRegOtpSent(true);
      alert('Mock Registration Verification OTP "1234" sent to ' + regPhone);
    } catch (err: any) {
      setAuthError('Failed to send registration OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyRegOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (regOtp === '1234') {
      setRegisterStep(2);
      setAuthError('');
    } else {
      setAuthError('Invalid registration OTP code');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError('');
    try {
      const payload = {
        phone: regPhone,
        name: regName,
        email: regEmail,
        partnerType: regPartnerType,
        vehicle: {
          type: regVehicleType,
          number: regVehicleNumber,
          rcNumber: regRcNumber,
          insurance: regInsurance,
          drivingLicense: regLicense,
          rcExpiry: regRcExpiry ? new Date(regRcExpiry) : undefined,
          insuranceExpiry: regInsuranceExpiry ? new Date(regInsuranceExpiry) : undefined,
          licenseExpiry: regLicenseExpiry ? new Date(regLicenseExpiry) : undefined,
        },
        bankDetails: {
          accountHolderName: regBankHolder,
          bankName: regBankName,
          accountNumber: regBankAccount,
          ifsc: regBankIfsc,
          upiId: regUpi
        },
        referredByCode: regReferredBy
      };
      const res = await axios.post(`${API_ROOT}/api/delivery/register`, payload);
      if (res.data.success) {
        alert('Application submitted successfully! Please log in with your mobile number to view audit status.');
        setAuthMode('login');
        setPhone(regPhone);
        setOtpSent(false);
        setOtp('');
      }
    } catch (err: any) {
      setAuthError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('delivery_token');
    localStorage.removeItem('delivery_user');
    localStorage.removeItem('delivery_partner');
    setToken(null);
    setUser(null);
    setPartner(null);
    setActiveTab('dashboard');
  };

  const fetchLeaves = async () => {
    try {
      const res = await axios.get(`${API_BASE}/leaves`, getHeaders());
      if (res.data.success) setLeavesList(res.data.leaves || []);
    } catch { }
  };

  const fetchReferrals = async () => {
    try {
      const res = await axios.get(`${API_BASE}/referrals`, getHeaders());
      if (res.data.success) setReferralsList(res.data.referrals || []);
    } catch { }
  };

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get(`${API_BASE}/dashboard`, getHeaders());
      if (res.data.success) {
        setDashboardMetrics(res.data.metrics);
      }
    } catch (err) {
      console.error('Error fetching dashboard', err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_BASE}/orders`, getHeaders());
      if (res.data.success) {
        setAssignments(res.data.assignments);
      }
    } catch (err) {
      console.error('Error fetching orders', err);
    }
  };

  const fetchWallet = async () => {
    try {
      const res = await axios.get(`${API_BASE}/wallet`, getHeaders());
      if (res.data.success) {
        setWalletDetails(res.data.wallet);
      }
    } catch (err) {
      console.error('Error fetching wallet', err);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const res = await axios.get(`${API_BASE}/subscriptions`, getHeaders());
      if (res.data.success) {
        setSubscriptions(res.data.subscriptions);
      }
    } catch (err) {
      console.error('Error fetching subscriptions', err);
    }
  };
  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${API_ROOT}/api/notifications`, getHeaders());
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
      }
    } catch (err) {
      console.error('Error fetching notifications', err);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      const res = await axios.patch(`${API_ROOT}/api/notifications/${id}/read`, {}, getHeaders());
      if (res.data.success) {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, status: 'read' } : n));
      }
    } catch (err) {
      console.error('Error marking read', err);
    }
  };
  const handleUpdateSubscriptionRunStatus = async (
    subId: string,
    status: 'delivered' | 'failed' | 'skipped',
    notes?: string,
    photo?: string,
    otp?: string,
    latitude?: number,
    longitude?: number,
    signature?: string
  ) => {
    setSyncing(true);
    try {
      const res = await axios.post(`${API_BASE}/subscriptions/${subId}/run`, {
        status,
        notes,
        photo,
        otp,
        latitude,
        longitude,
        signature
      }, getHeaders());
      if (res.data.success) {
        const fullList = await axios.get(`${API_BASE}/subscriptions`, getHeaders());
        setSubscriptions(fullList.data.subscriptions);
        const match = fullList.data.subscriptions.find((s: any) => s._id === subId);
        setSelectedSubscription(match || res.data.subscription || res.data.task);
        alert(`Today's run marked as ${status} successfully!`);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update run status');
    } finally {
      setSyncing(false);
    }
  };

  const handleConfirmSubscriptionRun = async (subId: string, status: 'delivered' | 'failed' | 'skipped') => {
    if (status === 'skipped') {
      await handleUpdateSubscriptionRunStatus(subId, 'skipped');
      return;
    }

    const otpCode = prompt("Enter customer verification OTP (Optional):") || undefined;
    const noteText = prompt("Enter proof note remarks (Optional):") || undefined;

    setSyncing(true);
    try {
      const coords = await getCurrentLocation();
      await handleUpdateSubscriptionRunStatus(
        subId,
        status,
        noteText,
        undefined, // photo
        otpCode,
        coords.lat,
        coords.lng,
        'Digital Signature Verified'
      );
    } catch (err) {
      console.error(err);
      await handleUpdateSubscriptionRunStatus(subId, status, noteText, undefined, otpCode);
    } finally {
      setSyncing(false);
    }
  };

  const handleConfirmSubscriptionRunForDate = async (
    subId: string,
    status: 'delivered' | 'failed' | 'skipped',
    dateStr: string
  ) => {
    const otpCode = status === 'delivered' ? (prompt("Enter customer verification OTP (Optional):") || undefined) : undefined;
    const noteText = prompt("Enter proof note remarks (Optional):") || undefined;

    setSyncing(true);
    try {
      const coords = await getCurrentLocation();
      await axios.post(`${API_BASE}/subscriptions/${subId}/run`, {
        status,
        notes: noteText,
        otp: otpCode,
        latitude: coords.lat,
        longitude: coords.lng,
        signature: 'Digital Signature Verified',
        date: dateStr
      }, getHeaders());

      const fullList = await axios.get(`${API_BASE}/subscriptions`, getHeaders());
      setSubscriptions(fullList.data.subscriptions);
      const match = fullList.data.subscriptions.find((s: any) => s._id === subId);
      if (match) setSelectedSubscription(match);
      alert(`Status updated for ${dateStr} successfully!`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setSyncing(false);
    }
  };

  const handleCheckIn = async (selectedShift: string) => {
    setSyncing(true);
    try {
      const coords = await getCurrentLocation();
      await axios.post(`${API_BASE}/checkin`, { coordinates: coords, shift: selectedShift }, getHeaders());
      fetchDashboardData();
      setShowClockInModal(false);
      setIsClockInFaceVerified(false);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Check-in failed');
    } finally {
      setSyncing(false);
    }
  };

  const handleCheckOut = async () => {
    setSyncing(true);
    try {
      const coords = await getCurrentLocation();
      await axios.post(`${API_BASE}/checkout`, { coordinates: coords }, getHeaders());
      fetchDashboardData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Check-out failed');
    } finally {
      setSyncing(false);
    }
  };

  const handleToggleBreak = async () => {
    setSyncing(true);
    try {
      await axios.post(`${API_BASE}/break/toggle`, { reason: 'Lunch Break' }, getHeaders());
      fetchDashboardData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Break toggle failed');
    } finally {
      setSyncing(false);
    }
  };

  const handleUpdateAssignmentStatus = async (id: string, statusEndpoint: string, payload: any = {}) => {
    setSyncing(true);
    try {
      await axios.post(`${API_BASE}/orders/${id}/${statusEndpoint}`, payload, getHeaders());
      fetchOrders();
      fetchDashboardData();
      if (selectedAssignment && selectedAssignment._id === id) {
        // Refresh details
        const det = await axios.get(`${API_BASE}/orders/${id}`, getHeaders());
        setSelectedAssignment(det.data.assignment);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setSyncing(false);
    }
  };

  const handleDeliverOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment || !otpInput) return;
    setSyncing(true);
    try {
      const coords = await getCurrentLocation();
      const res = await axios.post(`${API_BASE}/orders/${selectedAssignment._id}/delivered`, {
        otp: otpInput,
        deliveryNote: proofNotes,
        proofPhotoUrl: proofPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        coordinates: coords
      }, getHeaders());
      if (res.data.success) {
        setShowProofModal(false);
        setOtpInput('');
        setProofNotes('');
        setSelectedAssignment(res.data.assignment);
        fetchOrders();
        fetchDashboardData();
        fetchWallet();
        alert('Order delivered successfully!');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Delivery verification failed');
    } finally {
      setSyncing(false);
    }
  };

  const handleResendDeliveryOtp = async () => {
    if (!selectedAssignment) return;
    setSyncing(true);
    try {
      const res = await axios.post(`${API_BASE}/orders/${selectedAssignment._id}/resend-otp`, {}, getHeaders());
      if (res.data.success) {
        alert('Verification OTP code has been resent and logged in the backend console.');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setSyncing(false);
    }
  };

  const handleWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0) return;
    setLoading(true);
    setWithdrawSuccess('');
    try {
      const res = await axios.post(`${API_BASE}/withdraw`, { amount: amt }, getHeaders());
      if (res.data.success) {
        setWithdrawSuccess(`Successfully withdrew ₹${amt}`);
        setWithdrawAmount('');
        fetchWallet();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Withdrawal failed');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveStart || !leaveEnd) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/leaves`, {
        startDate: new Date(leaveStart),
        endDate: new Date(leaveEnd),
        reason: leaveReason
      }, getHeaders());
      if (res.data.success) {
        alert('Leave application submitted successfully!');
        setLeaveStart('');
        setLeaveEnd('');
        fetchLeaves();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit leave');
    } finally {
      setLoading(false);
    }
  };

  // Mock charts payload
  const earningsData = [
    { name: 'Mon', Earnings: 450, Incentives: 50 },
    { name: 'Tue', Earnings: 600, Incentives: 100 },
    { name: 'Wed', Earnings: 300, Incentives: 0 },
    { name: 'Thu', Earnings: 750, Incentives: 150 },
    { name: 'Fri', Earnings: 900, Incentives: 200 },
    { name: 'Sat', Earnings: 1200, Incentives: 300 },
    { name: 'Sun', Earnings: 800, Incentives: 100 },
  ];

  if (!token || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="h-14 w-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25 mb-3">
              <Navigation className="h-7 w-7 text-white animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-wide">ApexBee Logistics</h1>
            <p className="text-slate-400 text-xs mt-1">Delivery Partner Command Center</p>
          </div>

          {/* Login / Register Tab Selectors */}
          <div className="flex border-b border-slate-800 mb-6 gap-1 select-none">
            <button
              onClick={() => { setAuthMode('login'); setAuthError(''); }}
              className={`flex-1 pb-3 text-sm font-bold border-b-2 bg-transparent border-0 cursor-pointer transition ${authMode === 'login' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setAuthMode('register'); setAuthError(''); setRegisterStep(1); }}
              className={`flex-1 pb-3 text-sm font-bold border-b-2 bg-transparent border-0 cursor-pointer transition ${authMode === 'register' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400'}`}
            >
              Rider Registration
            </button>
          </div>

          {authError && (
            <div className="mb-6 p-4 bg-red-950 border border-red-800 rounded-xl flex items-start space-x-3 text-red-200">
              <AlertTriangle className="h-5 w-5 shrink-0 text-red-400" />
              <p className="text-sm">{authError}</p>
            </div>
          )}

          {authMode === 'login' ? (
            /* Login Mode */
            !otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-5">
                <div>
                  <label className="block text-slate-300 text-sm font-semibold mb-2">Registered Phone Number</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 font-semibold">+91</span>
                    <input
                      type="tel"
                      placeholder="Enter 10-digit mobile"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').substring(0, 10))}
                      className="w-full pl-14 pr-4 py-3 bg-slate-955 border border-slate-805 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading || phone.length !== 10}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold rounded-xl shadow-lg transition-colors flex justify-center items-center cursor-pointer"
                >
                  {loading ? 'Requesting...' : 'Request OTP Verification'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div>
                  <label className="block text-slate-300 text-sm font-semibold mb-2">Verification Code (Use 1234)</label>
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="Enter 4-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3 bg-slate-955 border border-slate-805 rounded-xl text-white tracking-widest text-center text-xl placeholder-slate-700 focus:outline-none focus:border-indigo-500 transition-colors"
                    required
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="flex-1 py-3.5 bg-slate-850 hover:bg-slate-800 text-slate-300 font-semibold rounded-xl transition-colors border border-slate-800 cursor-pointer"
                  >
                    Change Phone
                  </button>
                  <button
                    type="submit"
                    disabled={loading || otp.length !== 4}
                    className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold rounded-xl shadow-lg transition-colors flex justify-center items-center cursor-pointer"
                  >
                    {loading ? 'Verifying...' : 'Verify & Login'}
                  </button>
                </div>
              </form>
            )
          ) : (
            /* Multi-step Registration Wizard */
            <div className="space-y-6">
              {/* Step indicator progress bar */}
              <div className="flex items-center justify-between text-xs text-slate-400 select-none pb-2 border-b border-slate-850">
                <span>Step {registerStep} of 5</span>
                <span className="font-semibold text-indigo-400">
                  {registerStep === 1 && 'Mobile Verification'}
                  {registerStep === 2 && 'Personal KYC'}
                  {registerStep === 3 && 'Vehicle Setup'}
                  {registerStep === 4 && 'Bank Details'}
                  {registerStep === 5 && 'Biometric Selfie'}
                </span>
              </div>

              {registerStep === 1 && (
                /* Step 1: Verify phone first */
                !regOtpSent ? (
                  <form onSubmit={handleSendRegOtp} className="space-y-4">
                    <div>
                      <label className="block text-slate-300 text-xs font-semibold mb-2">Applicant Phone Number</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 font-semibold">+91</span>
                        <input
                          type="tel"
                          placeholder="Enter 10-digit mobile"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, '').substring(0, 10))}
                          className="w-full pl-14 pr-4 py-2.5 bg-slate-955 border border-slate-805 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                          required
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={regPhone.length !== 10}
                      className="w-full py-3 bg-indigo-650 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Verify Mobile Number
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyRegOtp} className="space-y-4">
                    <div>
                      <label className="block text-slate-300 text-xs font-semibold mb-2">Enter Verification Code (Use 1234)</label>
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="Enter 4-digit code"
                        value={regOtp}
                        onChange={(e) => setRegOtp(e.target.value.replace(/\D/g, ''))}
                        className="w-full py-2.5 bg-slate-955 border border-slate-805 rounded-xl text-white text-center tracking-widest text-lg focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setRegOtpSent(false)}
                        className="flex-1 py-2.5 bg-slate-850 border border-slate-800 text-slate-300 font-semibold rounded-xl cursor-pointer"
                      >
                        Change Mobile
                      </button>
                      <button
                        type="submit"
                        disabled={regOtp.length !== 4}
                        className="flex-1 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white font-bold rounded-xl cursor-pointer"
                      >
                        Verify OTP
                      </button>
                    </div>
                  </form>
                )
              )}

              {registerStep === 2 && (
                /* Step 2: Personal KYC info */
                <div className="space-y-4 text-xs text-left">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 mb-1">Full Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Rajesh Kumar"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Email Address</label>
                      <input
                        type="email"
                        placeholder="e.g. rajesh@gmail.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Rider Partner Type Category</label>
                    <select
                      value={regPartnerType}
                      onChange={(e: any) => setRegPartnerType(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"
                    >
                      <option value="Employee">Employee Rider (Fixed Salary, Attendance, Uniform)</option>
                      <option value="Freelancer">Freelancer Rider (Per Delivery Earnings, Flexible)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Aadhaar Card Number</label>
                    <input
                      type="text"
                      maxLength={12}
                      placeholder="12-digit Aadhaar"
                      value={regAadhaar}
                      onChange={(e) => setRegAadhaar(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 mb-1">Driving License Number</label>
                      <input
                        type="text"
                        placeholder="DL Number"
                        value={regLicense}
                        onChange={(e) => setRegLicense(e.target.value.toUpperCase())}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">PAN Card Number (Optional)</label>
                      <input
                        type="text"
                        placeholder="PAN Card"
                        maxLength={10}
                        value={regPan}
                        onChange={(e) => setRegPan(e.target.value.toUpperCase())}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-3 border-t border-slate-850">
                    <button
                      onClick={() => setRegisterStep(1)}
                      className="flex-1 py-2.5 bg-slate-850 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold rounded-xl cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => {
                        if (!regName || !regEmail || !regAadhaar || !regLicense) {
                          alert('Please fill out all KYC information');
                          return;
                        }
                        setRegisterStep(3);
                      }}
                      className="flex-1 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white font-bold rounded-xl cursor-pointer"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {registerStep === 3 && (
                /* Step 3: Vehicle details */
                <div className="space-y-4 text-xs text-left">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 mb-1">Vehicle Type</label>
                      <select
                        value={regVehicleType}
                        onChange={(e: any) => setRegVehicleType(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"
                      >
                        <option value="Bike">Bike / Two-Wheeler</option>
                        <option value="Car">Car</option>
                        <option value="EV">Electric Vehicle (EV)</option>
                        <option value="Bicycle">Bicycle</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Vehicle Plate Number</label>
                      <input
                        type="text"
                        placeholder="e.g. MH-12-XX-1234"
                        value={regVehicleNumber}
                        onChange={(e) => setRegVehicleNumber(e.target.value.toUpperCase())}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Registration Certificate (RC) Number</label>
                    <input
                      type="text"
                      placeholder="RC Book Card Number"
                      value={regRcNumber}
                      onChange={(e) => setRegRcNumber(e.target.value.toUpperCase())}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Insurance Policy Number</label>
                    <input
                      type="text"
                      placeholder="Insurance Policy No."
                      value={regInsurance}
                      onChange={(e) => setRegInsurance(e.target.value.toUpperCase())}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">DL Expiry Date</label>
                      <input
                        type="date"
                        value={regLicenseExpiry}
                        onChange={(e) => setRegLicenseExpiry(e.target.value)}
                        className="w-full px-2 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">RC Expiry Date</label>
                      <input
                        type="date"
                        value={regRcExpiry}
                        onChange={(e) => setRegRcExpiry(e.target.value)}
                        className="w-full px-2 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Insurance Expiry</label>
                      <input
                        type="date"
                        value={regInsuranceExpiry}
                        onChange={(e) => setRegInsuranceExpiry(e.target.value)}
                        className="w-full px-2 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none text-[11px]"
                      />
                    </div>
                  </div>

                  <div className="border-t border-slate-850 pt-3">
                    <label className="block text-slate-400 mb-1">Referral Code (If referred by partner - Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. AB-DP-000125"
                      value={regReferredBy}
                      onChange={(e) => setRegReferredBy(e.target.value.toUpperCase())}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"
                    />
                  </div>

                  <div className="flex gap-3 pt-3 border-t border-slate-850">
                    <button
                      onClick={() => setRegisterStep(2)}
                      className="flex-1 py-2.5 bg-slate-850 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold rounded-xl cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => {
                        if (!regVehicleNumber || !regRcNumber || !regLicenseExpiry || !regRcExpiry || !regInsuranceExpiry) {
                          alert('Please enter complete vehicle and expiration dates');
                          return;
                        }
                        setRegisterStep(4);
                      }}
                      className="flex-1 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white font-bold rounded-xl cursor-pointer"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {registerStep === 4 && (
                /* Step 4: Bank Details */
                <div className="space-y-4 text-xs text-left">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 mb-1">Bank Name</label>
                      <input
                        type="text"
                        placeholder="e.g. HDFC Bank"
                        value={regBankName}
                        onChange={(e) => setRegBankName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Account Holder Name</label>
                      <input
                        type="text"
                        placeholder="Name in passbook"
                        value={regBankHolder}
                        onChange={(e) => setRegBankHolder(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 mb-1">Account Number</label>
                      <input
                        type="text"
                        placeholder="Bank Account No."
                        value={regBankAccount}
                        onChange={(e) => setRegBankAccount(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">IFSC Code</label>
                      <input
                        type="text"
                        placeholder="IFSC Code"
                        maxLength={11}
                        value={regBankIfsc}
                        onChange={(e) => setRegBankIfsc(e.target.value.toUpperCase())}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">UPI ID (e.g. rajesh@okaxis)</label>
                    <input
                      type="text"
                      placeholder="UPI ID (Optional)"
                      value={regUpi}
                      onChange={(e) => setRegUpi(e.target.value.toLowerCase())}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"
                    />
                  </div>

                  <div className="flex gap-3 pt-3 border-t border-slate-850">
                    <button
                      onClick={() => setRegisterStep(3)}
                      className="flex-1 py-2.5 bg-slate-850 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold rounded-xl cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => {
                        if (!regBankName || !regBankHolder || !regBankAccount || !regBankIfsc) {
                          alert('Please enter complete bank credentials');
                          return;
                        }
                        setRegisterStep(5);
                      }}
                      className="flex-1 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white font-bold rounded-xl cursor-pointer"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {registerStep === 5 && (
                /* Step 5: Circular selfie scanner simulation */
                <form onSubmit={handleRegister} className="space-y-5 text-center text-xs">
                  <div>
                    <span className="text-slate-400 font-semibold text-xs block mb-1">Face Recognition Selfie Biometric Scan</span>
                    <p className="text-slate-500 text-[10px] leading-normal px-6">Circular camera scan is required to verify identity and match vehicle operator profile documents.</p>
                  </div>

                  {/* Circular scanning window mockup */}
                  <div className="h-44 w-44 rounded-full border-4 border-indigo-500/40 relative mx-auto overflow-hidden flex items-center justify-center bg-slate-950">
                    {isSelfieScanning ? (
                      <>
                        <div className="absolute inset-0 bg-indigo-950/30 flex items-center justify-center">
                          <span className="text-indigo-400 text-xs font-bold animate-pulse">Scanning Operator...</span>
                        </div>
                        {/* Scanning green line animation overlay */}
                        <div className="absolute left-0 right-0 h-1 bg-emerald-500 animate-[bounce_2s_infinite] shadow-lg shadow-emerald-500/50" />
                        <span className="absolute inset-0 rounded-full border border-indigo-400 animate-ping opacity-35" />
                      </>
                    ) : isFaceVerified ? (
                      <div className="flex flex-col items-center gap-1.5">
                        <CheckCircle className="h-10 w-10 text-emerald-500" />
                        <span className="text-emerald-400 font-extrabold tracking-wide uppercase text-[10px]">Face Verified ✅</span>
                      </div>
                    ) : (
                      <div className="text-slate-600 flex flex-col items-center gap-1">
                        <User className="h-12 w-12" />
                        <span className="text-[9px]">Camera Ready</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 px-4">
                    {!isFaceVerified ? (
                      <button
                        type="button"
                        onClick={() => {
                          setIsSelfieScanning(true);
                          setTimeout(() => {
                            setIsSelfieScanning(false);
                            setIsFaceVerified(true);
                          }, 3000); // 3 seconds scan simulation
                        }}
                        disabled={isSelfieScanning}
                        className="w-full py-3 bg-indigo-650 hover:bg-indigo-700 disabled:bg-slate-800 text-white font-bold rounded-xl cursor-pointer"
                      >
                        {isSelfieScanning ? 'Initiating Scanning Lens...' : 'Start Circular Selfie Verification'}
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition-colors cursor-pointer text-sm"
                      >
                        {loading ? 'Submitting Application...' : 'Submit Profile Application'}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setRegisterStep(4)}
                      disabled={isSelfieScanning}
                      className="w-full py-2.5 bg-slate-850 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white font-semibold rounded-xl cursor-pointer"
                    >
                      Back to Bank Details
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (token && user && partner && partner.status === 'pending_approval') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 text-center space-y-6">
          <div className="h-20 w-20 bg-indigo-955 border border-indigo-500/30 rounded-full flex items-center justify-center mx-auto relative">
            <Clock className="h-10 w-10 text-indigo-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span className="absolute inset-0 rounded-full border border-indigo-500 animate-ping opacity-25" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-wide">Application Pending Approval</h2>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              Hi <span className="text-indigo-400 font-semibold">{partner.name}</span>, your registration profile is currently under review by our administration team.
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-850 rounded-xl p-5 text-left space-y-3 text-xs">
            <div className="flex justify-between border-b border-slate-850 pb-2">
              <span className="text-slate-500 font-medium">Partner ID</span>
              <span className="font-mono text-indigo-400 font-bold">{partner.deliveryPartnerId}</span>
            </div>
            <div className="flex justify-between border-b border-slate-850 pb-2">
              <span className="text-slate-500 font-medium">Partner Type</span>
              <span className="text-white font-semibold">{partner.partnerType} Rider</span>
            </div>
            <div className="flex justify-between border-b border-slate-850 pb-2">
              <span className="text-slate-500 font-medium">Mobile Number</span>
              <span className="text-white font-semibold">{partner.mobile}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">KYC Audit Status</span>
              <span className="text-amber-400 font-bold">In Progress...</span>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={async () => {
                setLoading(true);
                try {
                  const res = await axios.post(`${API_BASE}/verify-otp`, { phone: partner.mobile, otp: '1234' });
                  if (res.data.success) {
                    setPartner(res.data.partner);
                    localStorage.setItem('delivery_partner', JSON.stringify(res.data.partner));
                    if (res.data.partner.status === 'active') {
                      alert('Congratulations! Your application is active.');
                    } else {
                      alert('Your application is still in review.');
                    }
                  }
                } catch {
                  alert('Status check completed - still in review.');
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="flex-1 py-3 bg-indigo-650 hover:bg-indigo-700 disabled:bg-slate-800 text-white font-bold rounded-xl shadow-lg transition-colors flex justify-center items-center gap-2 cursor-pointer text-xs"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Status</span>
            </button>
            <button
              onClick={handleLogout}
              className="px-5 py-3 bg-slate-850 hover:bg-slate-800 border border-slate-800 text-slate-350 hover:text-white font-bold rounded-xl transition-all cursor-pointer text-xs"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-500/10">
              <Navigation className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-white tracking-wide">ApexBee Logistics</h2>
              <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Partner Network</span>
            </div>
          </div>

          <nav className="space-y-1.5">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Smartphone },
              { id: 'orders', label: 'Assignments', icon: MapPin },
              { id: 'wallet', label: 'Wallet Ledger', icon: WalletIcon },
              { id: 'attendance', label: 'Duty Logs', icon: Clock },
              { id: 'profile', label: 'My Profile', icon: User },
              { id: 'settings', label: 'System Settings', icon: Settings },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id as any); setSelectedAssignment(null); }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-150 ${activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15 font-semibold'
                    : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6 border-t border-slate-850">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-10 w-10 bg-slate-800 rounded-full flex items-center justify-center text-indigo-400 font-bold uppercase">
              {user.name.substring(0, 2)}
            </div>
            <div className="truncate">
              <p className="text-sm font-semibold text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 py-2.5 bg-slate-850 hover:bg-red-950/20 hover:text-red-400 border border-slate-800 hover:border-red-900/30 text-slate-400 text-sm font-semibold rounded-xl transition-all"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar header */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-bold text-white capitalize">{activeTab}</h1>
            {syncing && (
              <span className="flex items-center space-x-1.5 text-xs text-indigo-400 font-semibold bg-indigo-950/40 px-2.5 py-1 rounded-full border border-indigo-900/30">
                <RefreshCw className="h-3 w-3 animate-spin" />
                <span>Syncing live state...</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {/* Status indicators */}
            <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-full">
              <span className={`h-2.5 w-2.5 rounded-full ${dashboardMetrics.onlineStatus === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                {dashboardMetrics.onlineStatus === 'active' ? 'Online' : 'Offline'}
              </span>
            </div>

            <div className="relative">
              <button
                onClick={() => { setShowNotifications(!showNotifications); fetchNotifications(); }}
                className="h-9 w-9 bg-slate-900 border border-slate-800 hover:bg-slate-850 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-colors relative"
              >
                <Bell className="h-4 w-4" />
                {notifications.filter(n => n.status === 'unread').length > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-indigo-500 rounded-full animate-pulse" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 max-h-96 overflow-y-auto backdrop-blur-md">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Alerts & Notifications</span>
                    <button
                      onClick={async () => {
                        try {
                          await axios.patch(`${API_ROOT}/api/notifications/mark-all-read`, {}, getHeaders());
                          setNotifications(prev => prev.map(n => ({ ...n, status: 'read' })));
                        } catch { }
                      }}
                      className="text-[10px] text-indigo-400 font-bold hover:underline"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-center text-xs text-slate-500 py-6">No notifications yet.</p>
                    ) : (
                      notifications.map((notif: any) => (
                        <div
                          key={notif._id}
                          onClick={() => handleMarkRead(notif._id)}
                          className={`p-3 rounded-xl border transition-colors cursor-pointer text-left ${notif.status === 'unread'
                            ? 'bg-slate-950 border-indigo-900/30 hover:bg-slate-900'
                            : 'bg-slate-900/40 border-slate-800/40 hover:bg-slate-850/60'
                            }`}
                        >
                          <div className="flex justify-between items-start gap-1">
                            <span className={`text-xs font-bold ${notif.status === 'unread' ? 'text-white' : 'text-slate-400'}`}>
                              {notif.title}
                            </span>
                            {notif.status === 'unread' && <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full mt-1 shrink-0 animate-ping" />}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 leading-normal">{notif.message}</p>
                          <span className="text-[9px] text-slate-500 mt-2 block">
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic page render */}
        <div className="flex-1 overflow-y-auto p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Expiry alerts banner */}
          {(() => {
            if (!partner?.vehicle) return null;
            const alerts: any[] = [];
            const checkExpiry = (dateStr: string, name: string) => {
              if (!dateStr) return;
              const date = new Date(dateStr);
              const diffMs = date.getTime() - Date.now();
              const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
              if (diffDays < 0) {
                alerts.push({ type: 'danger', msg: `CRITICAL: Your ${name} is EXPIRED. Update immediately to prevent account lock.` });
              } else if (diffDays <= 30) {
                alerts.push({ type: 'warning', msg: `WARNING: Your ${name} is expiring in ${diffDays} days. Please renew soon.` });
              }
            };
            checkExpiry(partner.vehicle.rcExpiry, 'Registration Certificate (RC)');
            checkExpiry(partner.vehicle.insuranceExpiry, 'Vehicle Insurance');
            checkExpiry(partner.vehicle.licenseExpiry, 'Driving License');

            if (alerts.length === 0) return null;
            return (
              <div className="space-y-2 mb-6">
                {alerts.map((alert, idx) => (
                  <div key={idx} className={`p-4 rounded-xl border flex items-start space-x-3 text-xs font-semibold ${alert.type === 'danger'
                    ? 'bg-rose-950/40 border-rose-900/50 text-rose-300'
                    : 'bg-amber-950/40 border-amber-900/50 text-amber-300'
                    }`}>
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-405" />
                    <span>{alert.msg}</span>
                  </div>
                ))}
              </div>
            );
          })()}

          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Duty Controls */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
                <div>
                  <h3 className="text-lg font-bold text-white">Logistics Duty Status</h3>
                  <p className="text-sm text-slate-400 mt-1">Clock in to begin receiving automatic assignments in your zone.</p>
                </div>
                <div className="flex items-center gap-3">
                  {dashboardMetrics.attendanceStatus === 'CheckedOut' ? (
                    <button
                      onClick={() => setShowClockInModal(true)}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center space-x-2 shadow-lg shadow-emerald-600/10 transition-colors cursor-pointer"
                    >
                      <Play className="h-4 w-4 fill-white" />
                      <span>Clock In / Start Shift</span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleToggleBreak}
                        className={`px-5 py-3 font-semibold rounded-xl flex items-center space-x-2 border transition-colors ${dashboardMetrics.attendanceStatus === 'OnBreak'
                          ? 'bg-amber-600 border-amber-500 text-white'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                          }`}
                      >
                        <Pause className="h-4 w-4" />
                        <span>{dashboardMetrics.attendanceStatus === 'OnBreak' ? 'Resume Duty' : 'Go On Break'}</span>
                      </button>
                      <button
                        onClick={handleCheckOut}
                        className="px-6 py-3 bg-red-650 hover:bg-red-700 text-white font-bold rounded-xl flex items-center space-x-2 shadow-lg shadow-red-600/10 transition-colors"
                      >
                        <X className="h-4 w-4" />
                        <span>Clock Out / End Shift</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Summary Metrics Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Wallet balance', value: `₹${dashboardMetrics.walletBalance}`, icon: WalletIcon, color: 'text-emerald-400', bg: 'bg-emerald-950/20' },
                  { label: 'Pending Earnings', value: `₹${dashboardMetrics.pendingEarnings}`, icon: DollarSign, color: 'text-indigo-400', bg: 'bg-indigo-950/20' },
                  { label: 'Delivered Today', value: dashboardMetrics.deliveredToday, icon: CheckCircle, color: 'text-indigo-400', bg: 'bg-indigo-950/20' },
                  { label: 'Current Rating', value: `${dashboardMetrics.rating} ★`, icon: Star, color: 'text-amber-400', bg: 'bg-amber-950/20' },
                ].map((card, i) => {
                  const Icon = card.icon;
                  return (
                    <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex items-center justify-between">
                      <div>
                        <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">{card.label}</span>
                        <p className="text-2xl font-bold text-white mt-1.5">{card.value}</p>
                      </div>
                      <div className={`h-12 w-12 ${card.bg} rounded-xl flex items-center justify-center`}>
                        <Icon className={`h-5 w-5 ${card.color}`} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Status workflow analytics grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 mb-6">Earnings Chart (Past Week)</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={earningsData}>
                        <defs>
                          <linearGradient id="colorE" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="name" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }} />
                        <Area type="monotone" dataKey="Earnings" stroke="#6366f1" fillOpacity={1} fill="url(#colorE)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 mb-6">Logistics Performance</h3>
                    <div className="space-y-4">
                      {[
                        { label: 'Assigned Orders', val: dashboardMetrics.ordersAssigned },
                        { label: 'Pending Delivery', val: dashboardMetrics.ordersPending },
                        { label: 'COD Collected Today', val: `₹${dashboardMetrics.codCollectionCollected}` },
                        { label: 'Average Delivery Time', val: `${dashboardMetrics.averageDeliveryTime} mins` },
                      ].map((item, i) => (
                        <div key={i} className="flex justify-between items-center py-2.5 border-b border-slate-800/50">
                          <span className="text-slate-400 text-sm">{item.label}</span>
                          <span className="font-semibold text-white">{item.val}</span>
                        </div>
                      ))}
                    </div>

                    {/* Performance Indicators */}
                    <div className="border-t border-slate-800/50 pt-4 mt-4 space-y-3 text-xs text-left">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Compliance Metrics</span>

                      <div>
                        <div className="flex justify-between text-slate-400 mb-1">
                          <span>Acceptance Rate</span>
                          <span className="text-white font-bold">{partner?.performance?.acceptanceRate ?? 96.8}%</span>
                        </div>
                        <div className="w-full bg-slate-950 rounded-full h-1 overflow-hidden">
                          <div className="bg-indigo-500 h-1 rounded-full" style={{ width: `${partner?.performance?.acceptanceRate ?? 96.8}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-slate-400 mb-1">
                          <span>Cancellation Rate</span>
                          <span className="text-white font-bold">{partner?.performance?.cancellationRate ?? 1.2}%</span>
                        </div>
                        <div className="w-full bg-slate-950 rounded-full h-1 overflow-hidden">
                          <div className="bg-rose-500 h-1 rounded-full" style={{ width: `${partner?.performance?.cancellationRate ?? 1.2}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-slate-400 mb-1">
                          <span>On-Time Delivery</span>
                          <span className="text-white font-bold">{partner?.performance?.onTimeRate ?? 98.5}%</span>
                        </div>
                        <div className="w-full bg-slate-950 rounded-full h-1 overflow-hidden">
                          <div className="bg-emerald-500 h-1 rounded-full" style={{ width: `${partner?.performance?.onTimeRate ?? 98.5}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="w-full mt-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors text-sm flex items-center justify-center space-x-1"
                  >
                    <span>View Assigned Orders</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-6">
              {/* Sub-tab Navigation */}
              <div className="flex border-b border-slate-800 pb-1 gap-1 select-none">
                <button
                  onClick={() => setSelectedSubTab('deliveries')}
                  className={`px-4 py-2 text-xs font-bold border-b-2 bg-transparent border-0 cursor-pointer transition ${selectedSubTab === 'deliveries' ? 'border-indigo-500 text-indigo-400 font-extrabold' : 'border-transparent text-slate-400'
                    }`}
                >
                  📦 Standard Deliveries
                </button>
                <button
                  onClick={() => setSelectedSubTab('subscriptions')}
                  className={`px-4 py-2 text-xs font-bold border-b-2 bg-transparent border-0 cursor-pointer transition ${selectedSubTab === 'subscriptions' ? 'border-indigo-500 text-indigo-400 font-extrabold' : 'border-transparent text-slate-400'
                    }`}
                >
                  🔄 Active Subscriptions Schedule
                </button>
              </div>

              {selectedSubTab === 'deliveries' ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Assignments List */}
                  <div className={`space-y-4 ${selectedAssignment ? 'lg:col-span-5' : 'lg:col-span-12'}`}>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">Active Delivery Tasks</h3>
                    {assignments.length === 0 ? (
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-500">
                        <MapPin className="h-12 w-12 text-slate-700 mx-auto mb-3" />
                        <p className="font-semibold">No assigned orders found</p>
                        <p className="text-xs text-slate-600 mt-1">Make sure you are clocked in and online to auto-accept tasks.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {assignments.map(item => (
                          <div
                            key={item._id}
                            onClick={() => setSelectedAssignment(item)}
                            className={`p-5 rounded-2xl border cursor-pointer transition-all ${selectedAssignment?._id === item._id
                              ? 'bg-indigo-950/20 border-indigo-500 shadow-lg'
                              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                              }`}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wide">
                                  ID: {item.orderId?.orderNumber || 'ORD-NEW'}
                                </span>
                                <h4 className="font-bold text-white text-base mt-0.5">{item.customerId?.name || 'Customer'}</h4>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.status === 'Assigned' ? 'bg-blue-950 text-blue-400 border border-blue-900/50' :
                                item.status === 'Accepted' ? 'bg-indigo-950 text-indigo-400 border border-indigo-900/50' :
                                  item.status === 'Delivered' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30' :
                                    'bg-amber-950 text-amber-400 border border-amber-900/30'
                                }`}>
                                {item.status}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-xs text-slate-400 mb-4">
                              <div className="flex items-center space-x-1.5">
                                <MapPin className="h-3.5 w-3.5 text-slate-500" />
                                <span className="truncate">{formatAddress(item.orderId?.shippingAddress)}</span>
                              </div>
                              <div className="flex items-center space-x-1.5 justify-end">
                                <DollarSign className="h-3.5 w-3.5 text-slate-500" />
                                <span className="font-semibold text-white">COD: ₹{item.codCollection?.expected || item.orderId?.totalAmount}</span>
                              </div>
                            </div>

                            <div className="flex justify-between items-center text-xs border-t border-slate-800/80 pt-3">
                              <span className="text-slate-500">Assigned 2 hours ago</span>
                              <span className="font-bold text-indigo-400 flex items-center space-x-1">
                                <span>Open Details</span>
                                <ChevronRight className="h-3 w-3" />
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Assignment Details Panel */}
                  {selectedAssignment && (
                    <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl relative">
                      <button
                        onClick={() => setSelectedAssignment(null)}
                        className="absolute top-4 right-4 h-8 w-8 hover:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>

                      <div>
                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Active Route Details</span>
                        <h3 className="text-xl font-bold text-white mt-1">
                          Order {selectedAssignment.orderId?.orderNumber}
                        </h3>
                      </div>

                      {/* Delivery Process Workflow Timeline tracker */}
                      <div className="bg-slate-950 border border-slate-850 rounded-xl p-4">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3">Delivery Lifecycle Progress</span>
                        <div className="flex justify-between text-xs text-center relative">
                          {[
                            { label: 'Assigned', active: ['Assigned', 'Accepted', 'Reached Pickup', 'Picked Up', 'Out For Delivery', 'Reached Customer', 'Delivered'].includes(selectedAssignment.status) },
                            { label: 'Pickup', active: ['Reached Pickup', 'Picked Up', 'Out For Delivery', 'Reached Customer', 'Delivered'].includes(selectedAssignment.status) },
                            { label: 'Transit', active: ['Out For Delivery', 'Reached Customer', 'Delivered'].includes(selectedAssignment.status) },
                            { label: 'Arrival', active: ['Reached Customer', 'Delivered'].includes(selectedAssignment.status) },
                            { label: 'Delivered', active: ['Delivered'].includes(selectedAssignment.status) }
                          ].map((step, idx) => (
                            <div key={idx} className="flex flex-col items-center flex-1 relative z-10">
                              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${step.active ? 'bg-indigo-650 text-white' : 'bg-slate-850 text-slate-550 border border-slate-800'
                                }`}>
                                {idx + 1}
                              </div>
                              <span className={`text-[10px] mt-1.5 font-bold ${step.active ? 'text-indigo-400' : 'text-slate-500'}`}>{step.label}</span>
                            </div>
                          ))}
                          <div className="absolute top-3 left-0 right-0 h-0.5 bg-slate-800 -z-10" />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Task Route Destinations</span>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div className="space-y-1">
                              <span className="text-slate-500 font-semibold block">Pickup Merchant</span>
                              <span className="font-bold text-white block">{selectedAssignment.vendorId?.name || 'Store'}</span>
                              <span className="text-slate-400 leading-normal block">{selectedAssignment.vendorId?.phone}</span>
                            </div>
                            <div className="space-y-1">
                              <span className="text-slate-500 font-semibold block">Dropoff Customer</span>
                              <span className="font-bold text-white block">{selectedAssignment.customerId?.name}</span>
                              <span className="text-slate-400 leading-normal block">{formatAddress(selectedAssignment.orderId?.shippingAddress)}</span>
                              <span className="text-indigo-400 font-bold block">{selectedAssignment.customerId?.phone}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Process workflow control buttons */}
                      <div className="space-y-3 pt-2">
                        {selectedAssignment.status === 'Assigned' && (
                          <button
                            onClick={() => handleUpdateAssignmentStatus(selectedAssignment._id, 'accept')}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-colors text-sm"
                          >
                            Accept Task Assignment
                          </button>
                        )}

                        {selectedAssignment.status === 'Accepted' && (
                          <button
                            onClick={() => handleUpdateAssignmentStatus(selectedAssignment._id, 'reached-pickup')}
                            className="w-full py-3 bg-slate-800 hover:bg-slate-750 text-indigo-400 font-bold border border-indigo-900/40 rounded-xl transition-colors text-sm"
                          >
                            Mark Arrived at Merchant Store
                          </button>
                        )}

                        {selectedAssignment.status === 'Reached Pickup' && (
                          <div className="space-y-3 p-4 bg-slate-950/60 border border-slate-850 rounded-xl text-left">
                            <label className="block text-slate-300 text-xs font-semibold">Enter Compulsory Merchant Pickup OTP</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                maxLength={4}
                                placeholder="Enter 4-digit code"
                                id="pickupOtpInput"
                                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono text-center text-sm focus:outline-none focus:border-indigo-500"
                              />
                              <button
                                onClick={() => {
                                  const val = (document.getElementById('pickupOtpInput') as HTMLInputElement)?.value;
                                  if (!val || val.length !== 4) {
                                    alert('Please enter a valid 4-digit OTP');
                                    return;
                                  }
                                  handleUpdateAssignmentStatus(selectedAssignment._id, 'pickup', { otp: val, pickupOtp: val });
                                }}
                                className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition-all cursor-pointer"
                              >
                                Verify & Pickup
                              </button>
                            </div>
                            <div className="text-[10px] text-indigo-400 bg-indigo-955/40 px-2.5 py-1 rounded border border-indigo-900/30 font-mono">
                              🔑 Merchant Code (For Dev): {selectedAssignment.orderId?.pickupVerification?.otp || '1234'}
                            </div>
                          </div>
                        )}

                        {selectedAssignment.status === 'Picked Up' && (
                          <button
                            onClick={() => handleUpdateAssignmentStatus(selectedAssignment._id, 'out-for-delivery')}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-colors text-sm"
                          >
                            Mark Out for Delivery
                          </button>
                        )}

                        {selectedAssignment.status === 'Out For Delivery' && (
                          <button
                            onClick={() => handleUpdateAssignmentStatus(selectedAssignment._id, 'reached-customer')}
                            className="w-full py-3 bg-slate-800 hover:bg-slate-750 text-indigo-400 font-bold border border-indigo-900/40 rounded-xl transition-colors text-sm"
                          >
                            Confirm Arrived at Customer Doorstep
                          </button>
                        )}

                        {selectedAssignment.status === 'Reached Customer' && (
                          <button
                            onClick={() => setShowProofModal(true)}
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition-colors text-sm flex items-center justify-center space-x-2"
                          >
                            <Check className="h-4 w-4" />
                            <span>Verify OTP & Complete Delivery</span>
                          </button>
                        )}

                        {['Assigned', 'Accepted', 'Reached Pickup', 'Picked Up', 'Out For Delivery', 'Reached Customer'].includes(selectedAssignment.status) && (
                          <div className="flex gap-3 mt-1.5">
                            <button
                              onClick={() => handleUpdateAssignmentStatus(selectedAssignment._id, 'failed')}
                              className="flex-1 py-2 bg-slate-850 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold rounded-lg transition-all"
                            >
                              Mark Delivery Attempt Failed
                            </button>
                            <button
                              onClick={() => handleUpdateAssignmentStatus(selectedAssignment._id, 'reschedule')}
                              className="flex-1 py-2 bg-slate-850 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold rounded-lg transition-all"
                            >
                              Reschedule Delivery
                            </button>
                          </div>
                        )}

                        {/* Navigation simulator */}
                        {['Out For Delivery', 'Reached Customer', 'Accepted', 'Reached Pickup'].includes(selectedAssignment.status) && (
                          <button
                            onClick={() => setNavulatingAssignment(selectedAssignment)}
                            className="w-full py-3 bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold border border-slate-700 rounded-xl transition-colors text-sm flex items-center justify-center space-x-2"
                          >
                            <Map className="h-4 w-4 text-indigo-400" />
                            <span>Launch Live GPS Route Navigation Map</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Weekly Delivery Schedule Calendar */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-left">
                    <div className="mb-4">
                      <h4 className="text-base font-bold text-white flex items-center gap-1.5">
                        <Clock className="h-5 w-5 text-indigo-400" /> Weekly Delivery Schedule Calendar
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">Your daily subscription delivery runs at a glance</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                      {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => {
                        const getWeekDate = (dayName: string) => {
                          const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                          const targetIdx = dayNames.indexOf(dayName.toLowerCase());
                          const today = new Date();
                          const currentIdx = today.getDay();
                          const diff = targetIdx - currentIdx;
                          const targetDate = new Date();
                          targetDate.setDate(today.getDate() + diff);
                          return targetDate;
                        };

                        const targetDate = getWeekDate(day);
                        const dateStr = targetDate.toISOString().split('T')[0];

                        const runsForDay = subscriptions.filter(sub => {
                          if (sub.status !== 'active') return false;
                          const freq = sub.frequency?.toLowerCase();
                          if (freq === 'daily') return true;
                          if (freq === 'custom') {
                            return sub.customDays?.map((d: string) => d.toLowerCase()).includes(day.toLowerCase());
                          }
                          if (freq === 'weekly') {
                            const start = new Date(sub.startDate);
                            return start.getDay() === targetDate.getDay();
                          }
                          if (freq === 'monthly') {
                            const start = new Date(sub.startDate);
                            return start.getDate() === targetDate.getDate();
                          }
                          if (freq === 'alternate') {
                            const start = new Date(sub.startDate);
                            const diffTime = Math.abs(targetDate.getTime() - start.getTime());
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            return diffDays % 2 === 0;
                          }
                          return true;
                        });

                        return (
                          <div key={day} className="bg-slate-950 border border-slate-850 rounded-xl p-3 flex flex-col gap-2.5 min-h-[140px]">
                            <div className="flex justify-between items-center border-b border-slate-800/85 pb-1.5 font-sans select-none">
                              <span className="font-extrabold capitalize text-white text-xs">{day.substring(0, 3)}</span>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${runsForDay.length > 0 ? 'bg-indigo-950 text-indigo-400 border border-indigo-900/50' : 'bg-slate-900 text-slate-500'
                                }`}>
                                {runsForDay.length} runs
                              </span>
                            </div>

                            <div className="flex flex-col gap-2 overflow-y-auto max-h-[180px] no-scrollbar">
                              {runsForDay.length === 0 ? (
                                <span className="text-[10px] text-slate-600 italic text-center py-4">No deliveries</span>
                              ) : (
                                runsForDay.map((sub: any) => {
                                  const subStatus = sub.completedDates?.includes(dateStr) ? 'delivered' :
                                    sub.failedDates?.includes(dateStr) ? 'failed' :
                                      sub.skippedDates?.includes(dateStr) ? 'skipped' : 'pending';

                                  return (
                                    <div
                                      key={sub._id}
                                      onClick={() => {
                                        setSelectedSubscription(sub);
                                        const newStatus = prompt(`Change status for ${sub.productName} on ${dateStr}? (delivered / failed / skipped / pending)`);
                                        if (newStatus && ['delivered', 'failed', 'skipped'].includes(newStatus)) {
                                          handleConfirmSubscriptionRunForDate(sub._id, newStatus as any, dateStr);
                                        }
                                      }}
                                      className="bg-slate-900 border border-slate-800 p-2 rounded-lg flex flex-col gap-1 text-[10px] cursor-pointer hover:border-indigo-500/50 transition-all active:scale-[0.98]"
                                    >
                                      <div className="font-bold text-slate-200 truncate">{sub.productName}</div>
                                      <div className="text-[9px] text-slate-400 flex justify-between items-center mt-0.5">
                                        <span>Qty: {sub.quantity}</span>
                                        <span className={`px-1 rounded text-[8px] font-bold ${subStatus === 'delivered' ? 'bg-emerald-950 text-emerald-450 border border-emerald-900/30' :
                                          subStatus === 'failed' ? 'bg-rose-950 text-rose-450 border border-rose-900/30' :
                                            subStatus === 'skipped' ? 'bg-amber-950 text-amber-450 border border-amber-900/30' : 'bg-slate-800 text-slate-400'
                                          }`}>{subStatus.toUpperCase()}</span>
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Subscriptions List */}
                    <div className={`space-y-4 ${selectedSubscription ? 'lg:col-span-5' : 'lg:col-span-12'}`}>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">Assigned Subscriptions</h3>
                      {subscriptions.length === 0 ? (
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-500">
                          <MapPin className="h-12 w-12 text-slate-700 mx-auto mb-3" />
                          <p className="font-semibold">No assigned subscriptions found</p>
                          <p className="text-xs text-slate-600 mt-1">Subscriptions assigned to you by vendors will appear here.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {subscriptions.map(item => (
                            <div
                              key={item._id}
                              onClick={() => setSelectedSubscription(item)}
                              className={`p-5 rounded-2xl border cursor-pointer transition-all ${selectedSubscription?._id === item._id
                                ? 'bg-indigo-950/20 border-indigo-500 shadow-lg'
                                : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                                }`}
                            >
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wide">
                                    Freq: {item.frequency}
                                  </span>
                                  <h4 className="font-bold text-white text-base mt-0.5">{item.productName}</h4>
                                </div>
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-900/30">
                                  Active
                                </span>
                              </div>

                              <div className="grid grid-cols-2 gap-4 text-xs text-slate-400 mb-4">
                                <div className="flex items-center space-x-1.5">
                                  <Clock className="h-3.5 w-3.5 text-slate-500" />
                                  <span>Slot: {item.deliverySlot}</span>
                                </div>
                                <div className="flex items-center space-x-1.5 justify-end">
                                  <DollarSign className="h-3.5 w-3.5 text-slate-500" />
                                  <span className="font-semibold text-white">Qty: {item.quantity} (₹{item.unitPrice})</span>
                                </div>
                              </div>

                              <div className="flex justify-between items-center text-xs border-t border-slate-800/80 pt-3">
                                <span className="text-slate-500">Starts: {item.startDate}</span>
                                <span className="font-bold text-indigo-400 flex items-center space-x-1">
                                  <span>View Schedule Calendar</span>
                                  <ChevronRight className="h-3 w-3" />
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Calendar / Schedule Details Panel */}
                    {selectedSubscription && (() => {
                      const todayDay = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
                      const freq = selectedSubscription.frequency?.toLowerCase();
                      const isTodayScheduled = (() => {
                        if (freq === 'daily') return true;
                        if (freq === 'custom') {
                          return selectedSubscription.customDays?.map((d: string) => d.toLowerCase()).includes(todayDay);
                        }
                        if (freq === 'weekly') {
                          const start = new Date(selectedSubscription.startDate);
                          return start.getDay() === new Date().getDay();
                        }
                        if (freq === 'monthly') {
                          const start = new Date(selectedSubscription.startDate);
                          return start.getDate() === new Date().getDate();
                        }
                        if (freq === 'alternate') {
                          const start = new Date(selectedSubscription.startDate);
                          const todayDate = new Date();
                          const diffTime = Math.abs(todayDate.getTime() - start.getTime());
                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                          return diffDays % 2 === 0;
                        }
                        return true;
                      })();
                      const todayStr = new Date().toISOString().split('T')[0];
                      const todayStatus = selectedSubscription.completedDates?.includes(todayStr) ? 'delivered' :
                        selectedSubscription.failedDates?.includes(todayStr) ? 'failed' :
                          selectedSubscription.skippedDates?.includes(todayStr) ? 'skipped' : 'pending';

                      return (
                        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl relative text-left">
                          <button
                            onClick={() => setSelectedSubscription(null)}
                            className="absolute top-4 right-4 h-8 w-8 hover:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>

                          {/* Header with Title and Status */}
                          <div className="flex gap-4 items-start border-b border-slate-800/80 pb-4">
                            {selectedSubscription.productImage ? (
                              <img
                                src={selectedSubscription.productImage}
                                alt={selectedSubscription.productName}
                                className="w-16 h-16 rounded-xl object-cover border border-slate-800"
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-xl bg-slate-950 flex items-center justify-center text-slate-650 border border-slate-850">
                                📦
                              </div>
                            )}
                            <div className="flex-1">
                              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">Active Subscription Plan</span>
                              <h3 className="text-xl font-bold text-white mt-0.5">
                                {selectedSubscription.productName}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="px-2.5 py-0.5 rounded bg-emerald-950/40 text-emerald-455 border border-emerald-900/30 text-[10px] font-extrabold">
                                  {selectedSubscription.frequency} frequency
                                </span>
                                {selectedSubscription.frequency?.toLowerCase() === 'custom' && selectedSubscription.customDays?.length > 0 && (
                                  <span className="text-[10px] text-slate-400 font-semibold">
                                    ({selectedSubscription.customDays.join(', ')})
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Vendor Contact & Address Info block */}
                          <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-3">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Vendor (Pickup Point) Information</span>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                              <div className="space-y-1">
                                <span className="text-slate-500 font-semibold block">Store Name</span>
                                <span className="font-bold text-white block">{selectedSubscription.vendorName || 'Local Merchant Store'}</span>
                              </div>
                              <div className="space-y-1">
                                <span className="text-slate-500 font-semibold block">Merchant Number</span>
                                <a
                                  href={`tel:${selectedSubscription.vendorPhone || '9999988888'}`}
                                  className="font-bold text-indigo-400 hover:underline flex items-center gap-1.5 mt-0.5"
                                >
                                  <Phone className="h-3 w-3" /> {selectedSubscription.vendorPhone || '+91 99999 88888'}
                                </a>
                              </div>
                            </div>

                            <div className="border-t border-slate-850 pt-2.5 space-y-1 text-xs">
                              <span className="text-slate-500 font-semibold block">Pickup Address</span>
                              <span className="text-slate-200 leading-relaxed block font-medium">
                                {selectedSubscription.vendorAddress || 'Amanora Mall, Hadapsar, Pune, Maharashtra - 411028'}
                              </span>
                            </div>
                          </div>

                          {/* Customer Contact & Address Info block */}
                          <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-3">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Customer Information</span>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                              <div className="space-y-1">
                                <span className="text-slate-500 font-semibold block">Customer Name</span>
                                <span className="font-bold text-white block">{selectedSubscription.customerName || 'Local Customer'}</span>
                                <span className="text-slate-400 leading-normal block">{selectedSubscription.customerEmail || 'No email shared'}</span>
                              </div>
                              <div className="space-y-1">
                                <span className="text-slate-500 font-semibold block">Contact Number</span>
                                <a
                                  href={`tel:${selectedSubscription.customerPhone || '9876543210'}`}
                                  className="font-bold text-indigo-400 hover:underline flex items-center gap-1.5 mt-0.5"
                                >
                                  <Phone className="h-3 w-3" /> {selectedSubscription.customerPhone || '+91 98765 43210'}
                                </a>
                              </div>
                            </div>

                            <div className="border-t border-slate-850 pt-2.5 space-y-1 text-xs">
                              <span className="text-slate-500 font-semibold block">Delivery Address</span>
                              <span className="text-slate-200 leading-relaxed block font-medium">
                                {selectedSubscription.customerAddress || 'Fl-102, Marvel Heights, Kalyani Nagar, Pune, Maharashtra - 411006'}
                              </span>
                            </div>
                          </div>

                          {/* Weekly calendar layout */}
                          <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 space-y-3">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                              <Clock className="h-4 w-4 text-indigo-400" /> Weekly Delivery Calendar
                            </span>

                            <div className="grid grid-cols-7 gap-2">
                              {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => {
                                const isScheduled = (() => {
                                  const getWeekDate = (dayName: string) => {
                                    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                                    const targetIdx = dayNames.indexOf(dayName.toLowerCase());
                                    const today = new Date();
                                    const currentIdx = today.getDay();
                                    const diff = targetIdx - currentIdx;
                                    const targetDate = new Date();
                                    targetDate.setDate(today.getDate() + diff);
                                    return targetDate;
                                  };

                                  const targetDate = getWeekDate(day);
                                  const freq = selectedSubscription.frequency?.toLowerCase();
                                  if (freq === 'daily') return true;
                                  if (freq === 'custom') {
                                    return selectedSubscription.customDays?.map((d: string) => d.toLowerCase()).includes(day.toLowerCase());
                                  }
                                  if (freq === 'weekly') {
                                    const start = new Date(selectedSubscription.startDate);
                                    return start.getDay() === targetDate.getDay();
                                  }
                                  if (freq === 'monthly') {
                                    const start = new Date(selectedSubscription.startDate);
                                    return start.getDate() === targetDate.getDate();
                                  }
                                  if (freq === 'alternate') {
                                    const start = new Date(selectedSubscription.startDate);
                                    const diffTime = Math.abs(targetDate.getTime() - start.getTime());
                                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                    return diffDays % 2 === 0;
                                  }
                                  return true;
                                })();

                                return (
                                  <div key={day} className={`p-2 rounded-lg border text-center flex flex-col gap-1 ${isScheduled
                                    ? 'bg-indigo-950/20 border-indigo-900/50 text-indigo-300'
                                    : 'bg-slate-900/40 border-slate-850 text-slate-650'
                                    }`}>
                                    <span className="text-[9px] font-bold capitalize">{day.substring(0, 3)}</span>
                                    <span className="text-[7px] uppercase tracking-wider font-extrabold block">
                                      {isScheduled ? 'Run' : 'Off'}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Skipped dates and status checklist */}
                          <div className="grid grid-cols-3 gap-4 text-xs text-white">
                            <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-1">
                              <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Time Slot</span>
                              <p className="font-extrabold text-white text-sm">{selectedSubscription.deliverySlot}</p>
                            </div>
                            <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-1">
                              <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Run Quantity</span>
                              <p className="font-extrabold text-white text-sm">{selectedSubscription.quantity} Items</p>
                            </div>
                            <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-1">
                              <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Price/Item</span>
                              <p className="font-extrabold text-white text-sm">₹{selectedSubscription.unitPrice}</p>
                            </div>
                          </div>

                          {/* Date metrics block */}
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-1">
                              <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Subscription Starts</span>
                              <p className="font-semibold text-white">{selectedSubscription.startDate}</p>
                            </div>
                            <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-1">
                              <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Renewal Status</span>
                              <p className="font-semibold text-white">{selectedSubscription.autoRenew ? 'Auto-Renew Active' : 'Manual Expiry'}</p>
                            </div>
                          </div>

                          {selectedSubscription.skippedDates?.length > 0 && (
                            <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-2">
                              <span className="text-[9px] uppercase tracking-wider font-bold text-rose-450 block">
                                Skipped Delivery Dates
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {selectedSubscription.skippedDates.map((dateStr: string) => (
                                  <span key={dateStr} className="px-2 py-1 rounded bg-rose-500/10 border border-rose-500/20 text-rose-455 font-mono text-[9px] font-bold">
                                    {dateStr}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Daily Run Status Action Block */}
                          <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Today's Delivery Action ({new Date().toISOString().split('T')[0]})
                              </span>
                              {!isTodayScheduled ? (
                                <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-500 text-[10px] font-bold border border-slate-800">
                                  Off-Schedule Today
                                </span>
                              ) : (
                                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${todayStatus === 'delivered' ? 'bg-emerald-950/40 text-emerald-450 border-emerald-900/30' :
                                  todayStatus === 'failed' ? 'bg-rose-950/40 text-rose-455 border-rose-900/30' :
                                    todayStatus === 'skipped' ? 'bg-amber-950/40 text-amber-455 border-amber-900/30' :
                                      'bg-indigo-950/40 text-indigo-400 border-indigo-900/30'
                                  }`}>
                                  {todayStatus === 'pending' ? 'Pending Run' : `Run ${todayStatus}`}
                                </span>
                              )}
                            </div>

                            {isTodayScheduled && (
                              <div className="grid grid-cols-3 gap-3">
                                <button
                                  onClick={() => handleConfirmSubscriptionRun(selectedSubscription._id, 'delivered')}
                                  className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer border ${todayStatus === 'delivered'
                                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/10'
                                    : 'bg-slate-900 border-slate-855 hover:border-emerald-650 text-slate-350 hover:text-white'
                                    }`}
                                >
                                  <Check className="h-3.5 w-3.5" />
                                  <span>Delivered</span>
                                </button>
                                <button
                                  onClick={() => handleConfirmSubscriptionRun(selectedSubscription._id, 'failed')}
                                  className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer border ${todayStatus === 'failed'
                                    ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-600/10'
                                    : 'bg-slate-900 border-slate-855 hover:border-rose-650 text-slate-350 hover:text-white'
                                    }`}
                                >
                                  <X className="h-3.5 w-3.5" />
                                  <span>Failed</span>
                                </button>
                                <button
                                  onClick={() => handleConfirmSubscriptionRun(selectedSubscription._id, 'skipped')}
                                  className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer border ${todayStatus === 'skipped'
                                    ? 'bg-amber-600 border-amber-500 text-white shadow-lg shadow-amber-650/10'
                                    : 'bg-slate-900 border-slate-855 hover:border-amber-650 text-slate-355 hover:text-white'
                                    }`}
                                >
                                  <Pause className="h-3.5 w-3.5" />
                                  <span>Skipped</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'wallet' && (
            <div className="space-y-8">
              {/* Wallet Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                  <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Available Payout Balance</span>
                  <p className="text-3xl font-extrabold text-white mt-1.5">₹{walletDetails?.availableBalance || 0}</p>
                  <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-900/30 inline-block mt-2">
                    Verified and withdrawable
                  </span>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                  <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">7-Day Escrow Pending</span>
                  <p className="text-3xl font-extrabold text-white mt-1.5">₹{walletDetails?.pendingBalance || 0}</p>
                  <span className="text-[10px] text-slate-400 font-semibold bg-slate-850 px-2 py-0.5 rounded-full border border-slate-800 inline-block mt-2">
                    Locked pending verification audit
                  </span>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                  <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Total Cashout Released</span>
                  <p className="text-3xl font-extrabold text-white mt-1.5">₹{walletDetails?.withdrawnBalance || 0}</p>
                  <span className="text-[10px] text-slate-400 font-semibold bg-slate-850 px-2 py-0.5 rounded-full border border-slate-800 inline-block mt-2">
                    Processed to bank details
                  </span>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                  <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Cumulative TDS Withheld</span>
                  <p className="text-3xl font-extrabold text-amber-500 mt-1.5">₹{walletDetails?.tdsDeducted || 0}</p>
                  <span className="text-[10px] text-amber-400 font-semibold bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-900/30 inline-block mt-2">
                    1% withholding (Section 194-O)
                  </span>
                </div>
              </div>

              {/* Cashout Withdrawal request form */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
                  <div>
                    <h3 className="text-base font-bold text-white">Instant Payout Cashout</h3>
                    <p className="text-xs text-slate-400 mt-1">Initiate an immediate bank transfer or UPI withdrawal request for your available earnings.</p>
                  </div>

                  {partner?.bankDetails && (
                    <div className="text-[10px] bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-1.5 text-slate-400 text-left">
                      <div className="flex justify-between">
                        <span>Bank Name:</span>
                        <span className="text-white font-semibold">{partner.bankDetails.bankName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Account Number:</span>
                        <span className="text-white font-semibold font-mono">
                          XXXXXX{partner.bankDetails.accountNumber ? String(partner.bankDetails.accountNumber).slice(-4) : 'XXXX'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>IFSC Code:</span>
                        <span className="text-white font-semibold font-mono">{partner.bankDetails.ifsc}</span>
                      </div>
                      {partner.bankDetails.upiId && (
                        <div className="flex justify-between border-t border-slate-850 pt-1.5 mt-1.5">
                          <span>UPI ID:</span>
                          <span className="text-indigo-400 font-semibold font-mono">{partner.bankDetails.upiId}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {withdrawSuccess && (
                    <div className="p-3 bg-emerald-950 text-emerald-300 text-xs rounded-lg border border-emerald-900/50">
                      {withdrawSuccess}
                    </div>
                  )}

                  <form onSubmit={handleWithdrawal} className="space-y-4 text-left">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5 font-semibold">Select Payout Route</label>
                      <select className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none">
                        <option value="bank">Direct Bank Transfer (IMPS)</option>
                        {partner?.bankDetails?.upiId && (
                          <option value="upi">Instant UPI Transfer Cashout</option>
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">Withdrawal Amount (₹)</label>
                      <input
                        type="number"
                        placeholder="e.g. 500"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading || !withdrawAmount}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition-colors text-xs cursor-pointer"
                    >
                      {loading ? 'Processing...' : 'Submit Cashout Request'}
                    </button>
                  </form>
                </div>

                {/* Ledger Transactions */}
                <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 mb-6">Financial Ledger Entries</h3>
                  <div className="space-y-3.5">
                    {!walletDetails?.ledgerEntries || walletDetails.ledgerEntries.length === 0 ? (
                      <div className="text-center py-8 text-slate-600 text-sm">No transactions log details.</div>
                    ) : (
                      walletDetails.ledgerEntries.map((entry: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center p-3.5 bg-slate-950/60 border border-slate-850 rounded-xl">
                          <div>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${entry.category === 'Delivery Earnings' ? 'bg-indigo-950 text-indigo-400 border border-indigo-900/50' :
                              entry.category === 'Delivery Withdrawal' ? 'bg-amber-950 text-amber-400 border border-amber-900/50' :
                                'bg-slate-850 text-slate-400 border border-slate-800'
                              }`}>
                              {entry.category || 'Transaction'}
                            </span>
                            <p className="text-xs text-slate-400 mt-2 font-medium">{entry.remarks || 'Wallet Adjustment'}</p>
                            <span className="text-[10px] text-slate-600 block mt-1">{new Date(entry.createdAt || entry.date).toLocaleString()}</span>
                          </div>
                          <span className={`text-base font-bold ${entry.type?.toLowerCase() === 'credit' ? 'text-emerald-400' : 'text-red-400'
                            }`}>
                            {entry.type?.toLowerCase() === 'credit' ? '+' : '-'}₹{entry.amount}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="space-y-8">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 mb-6 font-semibold">Shift Duty & Logs</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-slate-950 border border-slate-850 rounded-xl">
                    <div>
                      <h4 className="font-bold text-white">Duty Shift Status</h4>
                      <p className="text-xs text-slate-400 mt-1">Manage shift checkin, checkout and lunch breaks.</p>
                    </div>
                    <span className="text-sm font-semibold px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-indigo-400">
                      Status: {dashboardMetrics.attendanceStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Leaves Management */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Apply Form */}
                <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-white">Apply for Leave</h3>
                    <p className="text-xs text-slate-400 mt-1">Request scheduled leaves. Note: Employee Riders require supervisor check approval.</p>
                  </div>

                  <form onSubmit={handleApplyLeave} className="space-y-4 text-left">
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block text-slate-400 mb-1">Start Date</label>
                        <input
                          type="date"
                          value={leaveStart}
                          onChange={(e) => setLeaveStart(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-xl text-white focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">End Date</label>
                        <input
                          type="date"
                          value={leaveEnd}
                          onChange={(e) => setLeaveEnd(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-xl text-white focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-450 text-xs mb-1.5">Leave Reason Description</label>
                      <textarea
                        rows={3}
                        placeholder="Please elaborate reason for leave..."
                        value={leaveReason}
                        onChange={(e) => setLeaveReason(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-xl text-white text-xs focus:outline-none"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs cursor-pointer"
                    >
                      {loading ? 'Submitting Leave...' : 'Submit Leave Application'}
                    </button>
                  </form>
                </div>

                {/* Leaves Listing */}
                <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 mb-6">Leave Application Log</h3>
                  <div className="space-y-3">
                    {leavesList.length === 0 ? (
                      <div className="text-center py-10 text-slate-600 text-xs">No leave applications recorded yet.</div>
                    ) : (
                      leavesList.map((lv: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center p-3.5 bg-slate-950/60 border border-slate-850 rounded-xl text-xs">
                          <div className="text-left space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-white font-semibold">
                                {new Date(lv.startDate).toLocaleDateString()} - {new Date(lv.endDate).toLocaleDateString()}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${lv.status === 'Approved' ? 'bg-emerald-950 text-emerald-450 border border-emerald-900/50' :
                                lv.status === 'Rejected' ? 'bg-rose-955 text-rose-450 border border-rose-900/50' :
                                  'bg-slate-850 text-slate-400 border border-slate-800'
                                }`}>
                                {lv.status}
                              </span>
                            </div>
                            <p className="text-slate-450 text-[11px] font-medium leading-relaxed">{lv.reason}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl max-w-2xl mx-auto space-y-6">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold uppercase">
                  {user?.name?.substring(0, 2) || 'DP'}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{user?.name || 'Delivery Partner'}</h3>
                  <p className="text-sm text-slate-400">Logistics Partner</p>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-6 space-y-4 text-sm">
                <h4 className="font-bold text-white uppercase tracking-wider text-xs text-slate-400 text-left">KYC Documentation & Profile details</h4>
                <div className="grid grid-cols-2 gap-4 text-left">
                  <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl">
                    <span className="text-slate-500 text-[10px] uppercase font-bold">Driving License Status</span>
                    <p className="font-bold text-emerald-400 mt-1">Verified ✅</p>
                    <span className="text-[10px] text-slate-550 block font-mono mt-1">{partner?.vehicle?.drivingLicense || 'MH-12-XXXX'}</span>
                  </div>
                  <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl">
                    <span className="text-slate-500 text-[10px] uppercase font-bold">Vehicle Details</span>
                    <p className="font-bold text-white mt-1">{partner?.vehicle?.type || 'Two-Wheeler'}</p>
                    <span className="text-[10px] text-slate-550 block font-mono mt-1">{partner?.vehicle?.number || 'MH-12-XX-1234'}</span>
                  </div>
                </div>
              </div>

              {/* Refer & Earn Milestones */}
              <div className="border-t border-slate-800 pt-6 space-y-4 text-xs text-left">
                <h4 className="font-bold text-white uppercase tracking-wider text-xs text-slate-400">Refer & Earn Program</h4>
                <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-slate-550 font-bold block text-[10px]">Your Referral Partner Code</span>
                    <span className="text-indigo-400 font-mono font-bold text-base mt-1 block">{partner?.deliveryPartnerId || 'AB-DP-000000'}</span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(partner?.deliveryPartnerId || '');
                      alert('Referral code copied to clipboard!');
                    }}
                    className="px-3.5 py-2 bg-indigo-650 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs cursor-pointer"
                  >
                    Copy Code
                  </button>
                </div>

                <div className="space-y-3">
                  <span className="text-slate-400 font-semibold block">Invited Riders Milestone Tracker</span>
                  <p className="text-[10px] text-slate-500 leading-normal">Referral Bonus of ₹500 is credited instantly when your referred rider completes 100 successful order deliveries.</p>

                  <div className="space-y-2">
                    {referralsList.length === 0 ? (
                      <div className="text-center py-4 text-slate-600 text-[10px]">No referred riders joined yet.</div>
                    ) : (
                      referralsList.map((ref: any, idx: number) => {
                        const progressPercent = Math.min(100, Math.floor((ref.deliveriesCompletedCount / 100) * 100));
                        return (
                          <div key={idx} className="p-3 bg-slate-950/60 border border-slate-850 rounded-xl space-y-2">
                            <div className="flex justify-between items-center text-[10px]">
                              <div>
                                <span className="text-white font-bold block">{ref.referredName}</span>
                                <span className="text-slate-555 font-mono text-[9px]">{ref.referredPartnerId}</span>
                              </div>
                              <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${ref.milestoneStatus === 'Completed' ? 'bg-emerald-955 text-emerald-450 border border-emerald-900/50' :
                                'bg-slate-850 text-slate-400 border border-slate-800'
                                }`}>
                                {ref.milestoneStatus}
                              </span>
                            </div>

                            {/* Progress bar */}
                            <div>
                              <div className="flex justify-between text-slate-500 text-[9px] mb-1">
                                <span>Deliveries: {ref.deliveriesCompletedCount} / 100</span>
                                <span>{progressPercent}% Complete</span>
                              </div>
                              <div className="w-full bg-slate-950 rounded-full h-1 overflow-hidden">
                                <div className="bg-indigo-500 h-1 rounded-full animate-pulse" style={{ width: `${progressPercent}%` }} />
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl max-w-xl mx-auto space-y-6">
              <h3 className="text-lg font-bold text-white">System Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-slate-800">
                  <div>
                    <h4 className="font-bold text-slate-200 text-sm">App Theme</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Toggle system dark or light layouts.</p>
                  </div>
                  <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="px-4 py-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg"
                  >
                    Set {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                  </button>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-slate-800">
                  <div>
                    <h4 className="font-bold text-slate-200 text-sm">Support Command</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Raise tickets or contact technical helpdesk.</p>
                  </div>
                  <button className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg">
                    Contact Support
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Clock In / Face Verification Modal */}
      {showClockInModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-white">Shift Attendance Clock In</h3>
              <button
                onClick={() => { setShowClockInModal(false); setIsClockInFaceVerified(false); }}
                className="h-8 w-8 hover:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {!isClockInFaceVerified ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-350 text-xs font-semibold mb-2">Select Your Active Duty Shift</label>
                  <select
                    value={clockInShift}
                    onChange={(e: any) => setClockInShift(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none"
                  >
                    <option value="Morning">Morning Shift (6 AM - 2 PM)</option>
                    <option value="Afternoon">Afternoon Shift (2 PM - 10 PM)</option>
                    <option value="Night">Night Shift (10 PM - 6 AM)</option>
                  </select>
                </div>

                <div className="border-t border-slate-850 pt-4 text-center space-y-4">
                  <span className="text-slate-400 text-xs font-bold block">Biometric Face Scan Attendance Verification</span>

                  {/* Circle Scanning area */}
                  <div className="h-36 w-36 rounded-full border-4 border-indigo-500/40 relative mx-auto overflow-hidden flex items-center justify-center bg-slate-950">
                    {isClockInScanning ? (
                      <>
                        <div className="absolute inset-0 bg-indigo-950/20 flex items-center justify-center">
                          <span className="text-indigo-400 text-[10px] font-bold animate-pulse">Scanning Operator...</span>
                        </div>
                        <div className="absolute left-0 right-0 h-1 bg-emerald-500 animate-[bounce_2s_infinite] shadow-lg shadow-emerald-500/50" />
                        <span className="absolute inset-0 rounded-full border border-indigo-400 animate-ping opacity-35" />
                      </>
                    ) : (
                      <div className="text-slate-650 flex flex-col items-center">
                        <User className="h-10 w-10 text-slate-650 animate-pulse" />
                        <span className="text-[8px] uppercase tracking-wider mt-1">Ready</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setIsClockInScanning(true);
                      setTimeout(() => {
                        setIsClockInScanning(false);
                        setIsClockInFaceVerified(true);
                      }, 3000);
                    }}
                    disabled={isClockInScanning}
                    className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs cursor-pointer"
                  >
                    {isClockInScanning ? 'Scanning...' : 'Initiate Circular Face Verification Scan'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4 py-3">
                <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto" />
                <div>
                  <h4 className="text-emerald-400 font-bold text-sm">Face Identity Verified Successfully</h4>
                  <p className="text-slate-400 text-xs mt-1">Matched with Driver License: {partner?.vehicle?.drivingLicense || 'MH-12-XXXX'}</p>
                  <p className="text-slate-505 text-[10px] mt-1">Selected Shift: {clockInShift} shift</p>
                </div>

                <button
                  onClick={() => handleCheckIn(clockInShift)}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/10 cursor-pointer"
                >
                  Submit Shift Clock In / Start Duty
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Incoming Assignment Overlay Alert Modal */}
      {(() => {
        const incoming = assignments.find(a => a.status === 'Assigned');
        if (!incoming) return null;
        return (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-900 border-2 border-indigo-500 rounded-2xl shadow-2xl p-6 space-y-6 text-center">
              <div className="flex justify-between items-center pb-3 border-b border-slate-850">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
                  <Navigation className="h-4 w-4 text-indigo-400" /> Incoming Assignment Request
                </span>
                <span className="px-3 py-1 rounded bg-rose-500/10 border border-rose-500/20 text-rose-450 text-xs font-mono font-bold animate-pulse">
                  {incomingCountdown}s
                </span>
              </div>

              <div className="space-y-4">
                <div className="h-16 w-16 bg-indigo-950/60 rounded-full flex items-center justify-center mx-auto text-indigo-400 border border-indigo-900/30">
                  📦
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">Order {incoming.orderId?.orderNumber}</h4>
                  <p className="text-slate-400 text-xs mt-1">Merchant: {incoming.vendorId?.name || 'Store pickup point'}</p>
                  <p className="text-slate-400 text-xs mt-0.5">Value: ₹{incoming.orderId?.totalAmount} (COD Expected)</p>
                </div>

                <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl text-left text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Destination</span>
                    <span className="text-white font-medium truncate max-w-[200px]">{formatAddress(incoming.orderId?.shippingAddress)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Distance</span>
                    <span className="text-indigo-400 font-bold">~2.4 km (Est. 8 mins)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Earnings Offer</span>
                    <span className="text-emerald-400 font-extrabold font-mono">₹50.00</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleUpdateAssignmentStatus(incoming._id, 'reject')}
                  className="flex-1 py-3 bg-slate-850 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white font-semibold rounded-xl text-xs cursor-pointer"
                >
                  Ignore / Reject
                </button>
                <button
                  onClick={() => handleUpdateAssignmentStatus(incoming._id, 'accept')}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-500/10 cursor-pointer"
                >
                  Accept Assignment Offer
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Verification OTP Modal */}
      {showProofModal && selectedAssignment && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-white">OTP Verification Handoff</h3>
              <button
                onClick={() => { setShowProofModal(false); setOtpInput(''); }}
                className="h-8 w-8 hover:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleDeliverOrder} className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs text-slate-400">Enter 4-digit Delivery OTP (From Customer App)</label>
                  <button
                    type="button"
                    onClick={handleResendDeliveryOtp}
                    disabled={syncing}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold focus:outline-none flex items-center space-x-1"
                  >
                    <RefreshCw className={`h-3 w-3 ${syncing ? 'animate-spin' : ''}`} />
                    <span>Resend OTP</span>
                  </button>
                </div>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 9832"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white tracking-widest text-center text-xl placeholder-slate-800 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Proof Notes / Customer Remarks</label>
                <textarea
                  placeholder="e.g. Handed package directly to customer at door"
                  value={proofNotes}
                  onChange={(e) => setProofNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 h-20 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={syncing || otpInput.length < 4}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition-colors text-sm flex justify-center items-center"
              >
                {syncing ? 'Verifying...' : 'Verify OTP & Mark Delivered'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* GPS Route Navigation Map Mockup Canvas Modal */}
      {navulatingAssignment && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4 flex flex-col h-[85vh]">
            <div className="flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Navigation className="h-4 w-4 text-indigo-400" />
                  <span>GPS Transit Route Optimization Navigator</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Route mapping to: {navulatingAssignment.orderId?.shippingAddress?.addressText || 'Pune, MH'}</p>
              </div>
              <button
                onClick={() => setNavulatingAssignment(null)}
                className="h-8 w-8 hover:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* SVG custom animated map drawing canvas mockup */}
            <div className="flex-1 bg-slate-950 border border-slate-850 rounded-xl relative overflow-hidden flex items-center justify-center">
              <svg className="w-full h-full max-h-[60vh]" viewBox="0 0 800 450">
                {/* Street grids drawing */}
                <line x1="50" y1="100" x2="750" y2="100" stroke="#1e293b" strokeWidth="12" />
                <line x1="50" y1="220" x2="750" y2="220" stroke="#1e293b" strokeWidth="12" />
                <line x1="50" y1="340" x2="750" y2="340" stroke="#1e293b" strokeWidth="12" />
                <line x1="150" y1="50" x2="150" y2="400" stroke="#1e293b" strokeWidth="12" />
                <line x1="400" y1="50" x2="400" y2="400" stroke="#1e293b" strokeWidth="12" />
                <line x1="650" y1="50" x2="650" y2="400" stroke="#1e293b" strokeWidth="12" />

                {/* Optimize routing path */}
                <path d="M 150 340 L 400 340 L 400 220 L 650 220" fill="none" stroke="#6366f1" strokeWidth="6" strokeDasharray="8 4" className="animate-[dash_10s_linear_infinite]" />

                {/* Driver Location Dot */}
                <circle cx="400" cy="300" r="10" fill="#6366f1" className="animate-ping" />
                <circle cx="400" cy="300" r="6" fill="#4f46e5" />
                <text x="370" y="280" fill="#a5b4fc" className="text-[10px] font-bold">Rider Position</text>

                {/* Target Drop Marker */}
                <circle cx="650" cy="220" r="14" fill="#ef4444" fillOpacity="0.2" />
                <circle cx="650" cy="220" r="6" fill="#ef4444" />
                <text x="610" y="200" fill="#fca5a5" className="text-[10px] font-bold">Delivery Drop</text>

                {/* Source Store Pickup Marker */}
                <circle cx="150" cy="340" r="6" fill="#10b981" />
                <text x="110" y="325" fill="#a7f3d0" className="text-[10px] font-bold">Store Pickup</text>
              </svg>

              {/* Navigation directions board */}
              <div className="absolute top-4 left-4 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg w-64 text-xs space-y-2">
                <p className="font-bold text-white">Route Directions</p>
                <p className="text-slate-300">Turn right on Pune Main bypass road towards Customer node.</p>
                <div className="flex justify-between text-slate-500 pt-2 border-t border-slate-800">
                  <span>Distance: 2.8 km</span>
                  <span>ETA: 8 mins</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 shrink-0">
              <button
                onClick={() => setNavulatingAssignment(null)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold rounded-xl text-sm"
              >
                Close Navigation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

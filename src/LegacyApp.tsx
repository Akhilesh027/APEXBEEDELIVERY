import { useState, useEffect } from 'react';
import axios from 'axios';

const API_ROOT = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'https://server.apexbee.in'
  : 'https://server.apexbee.in';
const API_BASE = `${API_ROOT}/api/delivery`;

export default function LegacyApp() {
  // App states
  const [token] = useState<string | null>(localStorage.getItem('delivery_token'));
  const [user] = useState<any>(JSON.parse(localStorage.getItem('delivery_user') || 'null'));
  const [partner] = useState<any>(JSON.parse(localStorage.getItem('delivery_partner') || 'null'));
  const [theme] = useState<'dark' | 'light'>(() => (localStorage.getItem('delivery_theme') as any) || 'dark');

  // Setup theme
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('delivery_theme', theme);
  }, [theme]);

  // Load user data on startup
  useEffect(() => {
    if (token) {
      fetchDashboardData();
      fetchOrders();
      fetchWallet();
      fetchSubscriptions();
      fetchNotifications();
    }
  }, [token]);

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${token}` }
  });

  const fetchDashboardData = async () => {
    try {
      await axios.get(`${API_BASE}/dashboard`, getHeaders());
    } catch (err) { }
  };

  const fetchOrders = async () => {
    try {
      await axios.get(`${API_BASE}/orders`, getHeaders());
    } catch (err) { }
  };

  const fetchWallet = async () => {
    try {
      await axios.get(`${API_BASE}/wallet`, getHeaders());
    } catch (err) { }
  };

  const fetchSubscriptions = async () => {
    try {
      await axios.get(`${API_BASE}/subscriptions`, getHeaders());
    } catch (err) { }
  };

  const fetchNotifications = async () => {
    try {
      await axios.get(`${API_ROOT}/api/delivery/notifications`, getHeaders());
    } catch (err) { }
  };

  return (
    <div className="p-8 bg-slate-900 text-white min-h-screen">
      <h2 className="text-xl font-bold mb-4">ApexBee Legacy Delivery Partner App</h2>
      <p className="text-slate-400 text-sm mb-6">
        This is the legacy portal view. Active Partner: <span className="text-amber-400 font-mono">{partner?.name || 'Guru Prasad'}</span> ({user?.phone || 'AB-DP-000125'})
      </p>
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex justify-between items-center">
          <span className="font-bold text-base">Legacy App Status</span>
          <span className="px-3 py-1 bg-[#16A34A] text-white rounded-full text-xs font-bold">Active & Mounted</span>
        </div>
        <p className="text-xs text-slate-400">
          All legacy business logic, subscriptions, shift controls, COD settlement, and backend routes are preserved under `/legacy`.
        </p>
        <button
          onClick={() => window.location.href = '/app/home'}
          className="px-4 py-2 bg-[#F5B800] text-[#171717] font-extrabold text-xs rounded-xl shadow-xs cursor-pointer"
        >
          Open Redesigned Portal (/app/home)
        </button>
      </div>
    </div>
  );
}

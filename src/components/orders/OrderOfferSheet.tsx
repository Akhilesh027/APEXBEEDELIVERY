import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { orderService } from '../../services/orderService';
import { RejectReasonSheet } from './RejectReasonSheet';
import { MapPin, AlertCircle, X } from 'lucide-react';
import { useNavigate } from '../../app/simpleRouter';

export const OrderOfferSheet: React.FC = () => {
  const { partner, activeOffer } = useAppStore();
  const [showRejectSheet, setShowRejectSheet] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  if (!activeOffer) return null;

  const isDriverUnavailable = partner.availability === 'Offline' || partner.availability === 'Break';

  const pickupKm = Number(activeOffer.vendor?.pickupDistanceKm || 1.4);
  const dropoffKm = Number(activeOffer.customer?.deliveryDistanceKm || 4.8);
  const totalDistanceKm = pickupKm + dropoffKm;

  // Clean vendor address
  const rawVendorAddr =
    activeOffer.vendor?.address ||
    'NH67, బుచ్చిరెడ్డిపాలెం, Sri Potti Sriramulu Nellore, Andhra Pradesh, 524305, India';
  const cleanVendorAddress = rawVendorAddr.toLowerCase().includes('lb nagar')
    ? 'NH67, బుచ్చిరెడ్డిపాలెం, Sri Potti Sriramulu Nellore, Andhra Pradesh, 524305, India'
    : rawVendorAddr;

  const cleanCustomerAddress = activeOffer.customer?.address || 'Palodi, Adilabad, Telangana - 504312';

  // Realistic rider pay calculation: Base ₹35 + ₹7.50 per total Km
  const calculatedEarnings =
    activeOffer.estimatedEarnings && activeOffer.estimatedEarnings > 20
      ? activeOffer.estimatedEarnings
      : Math.max(68.0, Math.round(35 + totalDistanceKm * 7.5));

  // Dynamic estimated total time: (Total Distance * 3.5 mins/km) + 5 mins pickup buffer
  const calculatedEstTime =
    activeOffer.estimatedTotalTimeMins && activeOffer.estimatedTotalTimeMins > 10
      ? activeOffer.estimatedTotalTimeMins
      : Math.ceil(totalDistanceKm * 3.5 + 5);

  const handleAccept = async () => {
    if (isDriverUnavailable) {
      setError('Cannot accept orders while Offline or on Break. Change duty status first.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const success = await orderService.acceptOffer();
      if (success) {
        navigate(`/app/orders/active/${activeOffer.orderId}`);
      } else {
        setError('Failed to accept order offer. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Error accepting offer');
    } finally {
      setLoading(false);
    }
  };

  const vendorName =
    activeOffer.vendor?.name && activeOffer.vendor.name !== 'ApexBee Merchant Store'
      ? activeOffer.vendor.name
      : 'GNS Stores';

  return (
    <>
      <div className="fixed inset-0 bg-neutral-900/75 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="bg-white border border-[#E5E7EB] rounded-t-3xl sm:rounded-2xl shadow-2xl max-w-lg w-full p-5 sm:p-6 space-y-5 animate-in slide-in-from-bottom duration-200">
          {/* Header & Pending Status Bar */}
          <div className="flex justify-between items-center border-b border-[#E5E7EB] pb-3.5">
            <div className="flex items-center space-x-2">
              <span className="h-3 w-3 bg-[#F59E0B] rounded-full animate-ping" />
              <div>
                <h3 className="text-sm font-extrabold text-[#171717] tracking-tight">New Order Assignment Offer</h3>
                <span className="text-[11px] font-semibold text-[#6B7280]">{activeOffer.category}</span>
              </div>
            </div>

            {/* Pending Badge & Cross Dismiss Icon */}
            <div className="flex items-center space-x-2">
              <div className="px-3 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 bg-amber-50 text-[#854D0E] border border-[#F5B800]">
                <span className="h-2 w-2 rounded-full bg-[#F59E0B] animate-pulse" />
                <span>Pending Action</span>
              </div>

              <button
                onClick={() => setShowRejectSheet(true)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-full transition cursor-pointer"
                title="Dismiss & Reject Offer"
              >
                <X className="h-5 w-5 text-neutral-600" />
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-[#DC2626] flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Order Offer Details Box */}
          <div className="space-y-4 text-left">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-[#F59E0B] uppercase tracking-wider">
                  Order #{activeOffer.orderNumber}
                </span>
                <h2 className="text-lg font-extrabold text-[#171717] mt-0.5">{vendorName}</h2>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#6B7280] font-semibold block">Estimated Earnings</span>
                <span className="text-lg font-extrabold text-[#16A34A] font-mono">₹{calculatedEarnings.toFixed(2)}</span>
              </div>
            </div>

            {/* Route & Distance Information Card */}
            <div className="bg-[#F7F7F5] border border-[#E5E7EB] rounded-2xl p-4 space-y-3 text-xs">
              <div className="flex items-start space-x-2.5">
                <MapPin className="h-4 w-4 text-[#16A34A] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#171717] block">Pickup ({pickupKm} km)</span>
                  <span className="text-[#6B7280] leading-tight block mt-0.5">{cleanVendorAddress}</span>
                </div>
              </div>

              <div className="border-t border-[#E5E7EB] pt-2.5 flex items-start space-x-2.5">
                <MapPin className="h-4 w-4 text-[#F59E0B] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#171717] block">Dropoff ({dropoffKm} km)</span>
                  <span className="text-[#6B7280] leading-tight block mt-0.5">{cleanCustomerAddress}</span>
                </div>
              </div>
            </div>

            {/* Package & Payment Meta Grid */}
            <div className="grid grid-cols-3 gap-2.5 text-xs text-[#171717]">
              <div className="bg-white border border-[#E5E7EB] p-2.5 rounded-xl text-center">
                <span className="text-[10px] text-[#6B7280] font-bold block uppercase">Payment</span>
                <span className="font-extrabold text-[#171717] mt-0.5 block">{activeOffer.paymentType}</span>
              </div>
              <div className="bg-white border border-[#E5E7EB] p-2.5 rounded-xl text-center">
                <span className="text-[10px] text-[#6B7280] font-bold block uppercase">Packages</span>
                <span className="font-extrabold text-[#171717] mt-0.5 block">{activeOffer.packageCount} Bags</span>
              </div>
              <div className="bg-white border border-[#E5E7EB] p-2.5 rounded-xl text-center">
                <span className="text-[10px] text-[#6B7280] font-bold block uppercase">Est. Time</span>
                <span className="font-extrabold text-[#171717] mt-0.5 block">{calculatedEstTime} mins</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowRejectSheet(true)}
              disabled={loading}
              className="flex-1 py-3.5 bg-[#F7F7F5] hover:bg-neutral-200 text-[#171717] font-bold text-xs sm:text-sm rounded-xl border border-[#E5E7EB] transition-colors cursor-pointer"
            >
              Reject Offer
            </button>
            <button
              onClick={handleAccept}
              disabled={loading || isDriverUnavailable}
              className="flex-1 py-3.5 bg-[#F5B800] hover:bg-[#e0a800] disabled:bg-neutral-300 disabled:text-neutral-500 text-[#171717] font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer flex justify-center items-center"
            >
              {loading ? 'Accepting Task...' : 'Accept Order Assignment'}
            </button>
          </div>
        </div>
      </div>

      <RejectReasonSheet
        isOpen={showRejectSheet}
        onClose={() => setShowRejectSheet(false)}
        onSelectReason={(reason) => {
          orderService.rejectOffer(reason);
          setShowRejectSheet(false);
        }}
      />
    </>
  );
};

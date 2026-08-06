import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { orderService } from '../../services/orderService';
import { DeliveryProgressStepper } from '../../components/orders/DeliveryProgressStepper';
import { OrderStatusBadge } from '../../components/orders/OrderStatusBadge';
import { CallAction } from '../../components/orders/CallAction';
import { NavigationAction } from '../../components/orders/NavigationAction';
import { PrimaryDeliveryAction } from '../../components/orders/PrimaryDeliveryAction';
import { OtpInput } from '../../components/common/OtpInput';
import { CodPaymentScannerModal } from '../../components/orders/CodPaymentScannerModal';
import { MapPin, ShieldCheck, CheckCircle2, QrCode, Banknote } from 'lucide-react';
import { useNavigate } from '../../app/simpleRouter';

export const ActiveDeliveryPage: React.FC = () => {
  const { currentOrder } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [showScannerModal, setShowScannerModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentOrder) {
      orderService.getCurrentOffer().then((offer) => {
        if (offer) {
          useAppStore.setState({ currentOrder: offer });
        } else {
          orderService.getOrderHistory().then((history) => {
            const active = history.find((h) => h.status !== 'Delivered' && h.status !== 'Completed') || history[0];
            if (active) {
              useAppStore.setState({ currentOrder: active });
            }
          });
        }
      });
    }
  }, [currentOrder]);

  if (!currentOrder) {
    return (
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 text-center space-y-4">
        <MapPin className="h-12 w-12 text-[#6B7280] mx-auto animate-pulse" />
        <h3 className="text-base font-bold text-[#171717]">Loading Delivery Task Details...</h3>
        <p className="text-xs text-[#6B7280]">Connecting to ApexBee partner network for assignment verification.</p>
        <button
          onClick={() => navigate('/app/orders')}
          className="px-5 py-2.5 bg-[#171717] text-white font-bold text-xs rounded-xl cursor-pointer"
        >
          View Orders Roster
        </button>
      </div>
    );
  }

  const status = currentOrder.status;

  // Handlers for status transitions
  const handleReachedVendor = async () => {
    setLoading(true);
    try {
      await orderService.markReachedVendor();
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPickupOtp = async (otp: string) => {
    setLoading(true);
    setOtpError('');
    try {
      const valid = await orderService.verifyPickupOtp(otp);
      if (!valid) {
        setOtpError(`Invalid Pickup OTP. Please enter code ${currentOrder.vendor.pickupOtp || '3431'}.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPickup = async () => {
    setLoading(true);
    try {
      await orderService.confirmPickup();
    } finally {
      setLoading(false);
    }
  };

  const handleReachedCustomer = async () => {
    setLoading(true);
    try {
      await orderService.markReachedCustomer();
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDeliveryOtp = async (otp: string) => {
    setLoading(true);
    setOtpError('');
    try {
      const valid = await orderService.verifyDeliveryOtp(otp);
      if (!valid) {
        setOtpError(`Invalid Delivery OTP. Please enter code ${currentOrder.customer.deliveryOtp || '3221'}.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteDelivery = async () => {
    setLoading(true);
    try {
      await orderService.completeDelivery();
      navigate('/app/orders/success');
    } finally {
      setLoading(false);
    }
  };

  const isStage1 = ['Accepted', 'Assigned', 'pending', 'Placed', 'Shipped'].includes(status);
  const isStage2 = ['Reached Vendor', 'Pickup OTP Verified'].includes(status);
  const isStage3 = ['Picked Up', 'Out for Delivery'].includes(status);
  const isStage4 = ['Reached Customer', 'Delivery OTP Verified'].includes(status);

  const codAmount = currentOrder.codAmount || currentOrder.estimatedEarnings || 5;

  const vendorAddress =
    currentOrder.vendor?.address && !currentOrder.vendor.address.toLowerCase().includes('lb nagar')
      ? currentOrder.vendor.address
      : 'NH67, బుచ్చిరెడ్డిపాలెం, Sri Potti Sriramulu Nellore, Andhra Pradesh, 524305, India';

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header Info */}
      <div className="flex justify-between items-center bg-white border border-[#E5E7EB] rounded-2xl p-4 sm:p-5 shadow-xs">
        <div>
          <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider block">
            Active Task Assignment
          </span>
          <h2 className="text-lg font-extrabold text-[#171717] mt-0.5">{currentOrder.orderNumber}</h2>
        </div>
        <OrderStatusBadge status={status} />
      </div>

      {/* Progress Stepper */}
      <DeliveryProgressStepper currentStatus={status} />

      {/* STAGE 1: ACCEPTED - Heading to Vendor */}
      {isStage1 && (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs">
          <div className="flex justify-between items-start border-b border-[#E5E7EB] pb-4">
            <div>
              <span className="text-xs font-bold text-[#16A34A] uppercase tracking-wider block">
                Pickup Destination
              </span>
              <h3 className="text-xl font-extrabold text-[#171717] mt-0.5">{currentOrder.vendor.name || 'GNS Stores'}</h3>
              <p className="text-xs text-[#6B7280] font-medium mt-1">{vendorAddress}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-[#6B7280] font-semibold block">Pickup Distance</span>
              <span className="text-base font-extrabold text-[#171717]">{currentOrder.vendor.pickupDistanceKm} km</span>
              <span className="text-[11px] text-[#6B7280] block mt-0.5">Est. {currentOrder.vendor.estimatedArrivalMins} mins</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <CallAction phone={currentOrder.vendor.phone} label="Call Merchant" />
            <NavigationAction address={vendorAddress} label="Open Pickup Route" />
          </div>

          <div className="bg-[#F7F7F5] border border-[#E5E7EB] rounded-xl p-4 space-y-2 text-xs">
            <span className="font-bold text-[#171717] uppercase tracking-wider block">Handling & Package Details</span>
            <div className="flex justify-between text-[#6B7280]">
              <span>Package Count: <strong className="text-[#171717]">{currentOrder.packageCount} Bags</strong></span>
              <span>Category: <strong className="text-[#171717]">{currentOrder.category}</strong></span>
            </div>
            {currentOrder.handlingInstructions && (
              <p className="text-[#171717] font-semibold pt-1 border-t border-[#E5E7EB]">
                Note: {currentOrder.handlingInstructions}
              </p>
            )}
          </div>

          <PrimaryDeliveryAction
            label="I Have Reached the Vendor"
            onClick={handleReachedVendor}
            loading={loading}
          />
        </div>
      )}

      {/* STAGE 2: REACHED VENDOR / PICKUP OTP VERIFICATION */}
      {isStage2 && (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs">
          <div className="border-b border-[#E5E7EB] pb-4">
            <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider block">
              Vendor Store Handoff
            </span>
            <h3 className="text-xl font-extrabold text-[#171717] mt-0.5">{currentOrder.vendor.name}</h3>
            <p className="text-xs text-[#6B7280] mt-0.5">Verify 4-digit merchant pickup OTP code to collect packages.</p>
          </div>

          {status === 'Reached Vendor' ? (
            <div className="space-y-4 text-center">
              <span className="text-xs font-bold text-[#171717] block">
                Enter Merchant Pickup OTP (OTP: {currentOrder.vendor.pickupOtp || '3431'})
              </span>
              <OtpInput onComplete={handleVerifyPickupOtp} error={otpError} disabled={loading} />
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-[#2563EB] font-semibold inline-flex items-center space-x-1.5">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>Ask store merchant for 4-digit verification code</span>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
              <CheckCircle2 className="h-8 w-8 text-[#16A34A] mx-auto" />
              <h4 className="text-sm font-extrabold text-[#16A34A]">Pickup OTP Verified Successfully</h4>
              <p className="text-xs text-emerald-800">Packages collected. Ready to confirm pickup and proceed to customer.</p>
            </div>
          )}

          <div className="pt-2">
            <PrimaryDeliveryAction
              label="Confirm Order Picked Up"
              onClick={handleConfirmPickup}
              disabled={status !== 'Pickup OTP Verified'}
              loading={loading}
            />
          </div>
        </div>
      )}

      {/* STAGE 3: PICKED UP / OUT FOR DELIVERY - Heading to Customer */}
      {isStage3 && (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs">
          <div className="flex justify-between items-start border-b border-[#E5E7EB] pb-4">
            <div>
              <span className="text-xs font-bold text-[#F59E0B] uppercase tracking-wider block">
                Customer Delivery Dropoff
              </span>
              <h3 className="text-xl font-extrabold text-[#171717] mt-0.5">{currentOrder.customer.name}</h3>
              <p className="text-xs text-[#6B7280] font-medium mt-1">{currentOrder.customer.address}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-[#6B7280] font-semibold block">Delivery Distance</span>
              <span className="text-base font-extrabold text-[#171717]">{currentOrder.customer.deliveryDistanceKm} km</span>
              <span className="text-[11px] text-[#6B7280] block mt-0.5">Est. {currentOrder.customer.estimatedArrivalMins} mins</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <CallAction phone={currentOrder.customer.phone} label="Call Customer" />
            <NavigationAction address={currentOrder.customer.address} label="Open Dropoff Route" />
          </div>

          {currentOrder.paymentType === 'COD' && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-amber-900">
                <div className="flex items-center space-x-2">
                  <Banknote className="h-5 w-5 text-[#F59E0B]" />
                  <span>Cash on Delivery (COD) Payment Due</span>
                </div>
                <span className="text-base font-extrabold text-[#171717] font-mono">
                  ₹{codAmount.toFixed(2)}
                </span>
              </div>

              {currentOrder.codCollected ? (
                <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-xs font-extrabold text-[#16A34A] flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>Payment Verified & Collected via {currentOrder.codPaymentMethod || 'UPI/Cash'}</span>
                  </div>
                  <span className="font-mono">₹{codAmount.toFixed(2)}</span>
                </div>
              ) : (
                <button
                  onClick={() => setShowScannerModal(true)}
                  className="w-full py-3 bg-[#171717] hover:bg-neutral-800 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <QrCode className="h-4 w-4 text-[#F5B800]" />
                  <span>Collect Payment (Show/Scan UPI QR or Cash)</span>
                </button>
              )}
            </div>
          )}

          {currentOrder.customer.instructions && (
            <div className="bg-[#F7F7F5] border border-[#E5E7EB] p-3.5 rounded-xl text-xs space-y-1">
              <span className="font-bold text-[#171717] block">Delivery Instructions:</span>
              <p className="text-[#6B7280] font-medium">{currentOrder.customer.instructions}</p>
            </div>
          )}

          <PrimaryDeliveryAction
            label="I Have Reached the Customer"
            onClick={handleReachedCustomer}
            loading={loading}
          />
        </div>
      )}

      {/* STAGE 4: REACHED CUSTOMER / DELIVERY OTP VERIFICATION */}
      {isStage4 && (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs">
          <div className="border-b border-[#E5E7EB] pb-4">
            <span className="text-xs font-bold text-[#16A34A] uppercase tracking-wider block">
              Customer Doorstep Verification
            </span>
            <h3 className="text-xl font-extrabold text-[#171717] mt-0.5">{currentOrder.customer.name}</h3>
            <p className="text-xs text-[#6B7280] mt-0.5">Ask customer for 4-digit delivery verification OTP code.</p>
          </div>

          {currentOrder.paymentType === 'COD' && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-amber-900">
                <div className="flex items-center space-x-2">
                  <Banknote className="h-5 w-5 text-[#F59E0B]" />
                  <span>Cash on Delivery (COD) Payment Due</span>
                </div>
                <span className="text-base font-extrabold text-[#171717] font-mono">
                  ₹{codAmount.toFixed(2)}
                </span>
              </div>

              {currentOrder.codCollected ? (
                <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-xs font-extrabold text-[#16A34A] flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>Payment Verified & Collected via {currentOrder.codPaymentMethod || 'UPI/Cash'}</span>
                  </div>
                  <span className="font-mono">₹{codAmount.toFixed(2)}</span>
                </div>
              ) : (
                <button
                  onClick={() => setShowScannerModal(true)}
                  className="w-full py-3 bg-[#171717] hover:bg-neutral-800 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <QrCode className="h-4 w-4 text-[#F5B800]" />
                  <span>Collect Payment (Show/Scan UPI QR or Cash)</span>
                </button>
              )}
            </div>
          )}

          {status === 'Reached Customer' ? (
            <div className="space-y-4 text-center">
              <span className="text-xs font-bold text-[#171717] block">
                Enter Customer Delivery OTP (OTP: {currentOrder.customer.deliveryOtp || '3221'})
              </span>
              <OtpInput onComplete={handleVerifyDeliveryOtp} error={otpError} disabled={loading} />
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-[#16A34A] font-semibold inline-flex items-center space-x-1.5">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>Customer receives OTP on their registered mobile app</span>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
              <CheckCircle2 className="h-8 w-8 text-[#16A34A] mx-auto" />
              <h4 className="text-sm font-extrabold text-[#16A34A]">Delivery OTP Verified Successfully</h4>
              <p className="text-xs text-emerald-800">OTP verified. Click Complete Delivery to mark task completed.</p>
            </div>
          )}

          <div className="pt-2">
            <PrimaryDeliveryAction
              label="Complete Delivery"
              onClick={handleCompleteDelivery}
              disabled={status !== 'Delivery OTP Verified'}
              loading={loading}
              variant="success"
            />
          </div>
        </div>
      )}

      {/* COD Payment Scanner Modal */}
      <CodPaymentScannerModal
        isOpen={showScannerModal}
        onClose={() => setShowScannerModal(false)}
        orderNumber={currentOrder.orderNumber}
        amount={codAmount}
        customerName={currentOrder.customer.name}
        onPaymentConfirmed={(method) => {
          orderService.confirmCodPayment(method);
        }}
      />
    </div>
  );
};


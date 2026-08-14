import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import type { OrderOffer } from '../../types/order';
import { orderService } from '../../services/orderService';
import { DeliveryProgressStepper } from '../../components/orders/DeliveryProgressStepper';
import { OrderStatusBadge } from '../../components/orders/OrderStatusBadge';
import { CallAction } from '../../components/orders/CallAction';
import { NavigationAction } from '../../components/orders/NavigationAction';
import { PrimaryDeliveryAction } from '../../components/orders/PrimaryDeliveryAction';
import { OtpInput } from '../../components/common/OtpInput';
import { CodPaymentScannerModal } from '../../components/orders/CodPaymentScannerModal';
import { ShieldCheck, CheckCircle2, QrCode, Banknote, Flame, UtensilsCrossed } from 'lucide-react';
import { useNavigate } from '../../app/simpleRouter';

export const ActiveDeliveryPage: React.FC = () => {
  const { currentOrder } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [showScannerModal, setShowScannerModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCurrent = async () => {
      const offer = await orderService.getCurrentOffer();
      if (offer) {
        const storeCurrent = useAppStore.getState().currentOrder;
        const wasCollected = Boolean(storeCurrent?.codCollected || offer.codCollected);
        useAppStore.setState({
          currentOrder: {
            ...offer,
            codCollected: wasCollected,
            codPaymentMethod: wasCollected ? (storeCurrent?.codPaymentMethod || offer.codPaymentMethod || 'UPI') : offer.codPaymentMethod,
            paymentStatus: wasCollected ? 'Paid' : (offer.paymentStatus || 'Pending'),
            isPaid: wasCollected ? true : offer.isPaid
          }
        });
      }
    };
    fetchCurrent();
    const interval = setInterval(fetchCurrent, 3500);
    return () => clearInterval(interval);
  }, []);

  const pathParts = typeof window !== 'undefined' ? window.location.pathname.split('/') : [];
  const urlOrderId = pathParts[pathParts.length - 1];

  const currentOrderObj: OrderOffer = currentOrder || {
    orderId: urlOrderId || '6a758d8f261aa351a95c4ca4',
    orderNumber: `AB-${urlOrderId ? urlOrderId.slice(-8).toUpperCase() : 'LIVE-TASK'}`,
    vendor: {
      id: 'vendor_001',
      name: 'Palodi Kitchen & Restaurant',
      address: 'Palodi Road, Adilabad, Telangana - 504312',
      phone: '9177176969',
      pickupDistanceKm: 1.4,
      estimatedArrivalMins: 6,
      pickupOtp: '3431'
    },
    customer: {
      id: 'customer_001',
      name: 'Akhilesh Reddy',
      phone: '9707010797',
      address: 'Railway Gate Lane, Hyderabad, Telangana, 504312',
      deliveryDistanceKm: 4.8,
      estimatedArrivalMins: 22,
      deliveryOtp: '3221'
    },
    paymentType: 'COD' as const,
    codAmount: 36.00,
    category: 'Food & Dining',
    packageCount: 1,
    estimatedTotalTimeMins: 25,
    estimatedEarnings: 68.00,
    expiresInSeconds: 0,
    status: 'ready_for_pickup' as const
  };

  const status = currentOrderObj.status;

  const updateCurrentOfferWithPreservedPayment = async (newStatus?: string) => {
    const offer = await orderService.getCurrentOffer();
    const wasCollected = Boolean(currentOrderObj.codCollected || useAppStore.getState().currentOrder?.codCollected);
    if (offer) {
      useAppStore.setState({
        currentOrder: {
          ...offer,
          status: newStatus || offer.status,
          codCollected: wasCollected,
          codPaymentMethod: wasCollected ? (currentOrderObj.codPaymentMethod || offer.codPaymentMethod || 'UPI') : offer.codPaymentMethod,
          paymentStatus: wasCollected ? 'Paid' : (offer.paymentStatus || 'Pending'),
          isPaid: wasCollected ? true : offer.isPaid
        }
      });
    } else if (currentOrderObj && newStatus) {
      useAppStore.setState({
        currentOrder: {
          ...currentOrderObj,
          status: newStatus,
          codCollected: wasCollected,
          paymentStatus: wasCollected ? 'Paid' : currentOrderObj.paymentStatus,
          isPaid: wasCollected ? true : currentOrderObj.isPaid
        }
      });
    }
  };

  // Handlers for status transitions
  const handleReachedVendor = async () => {
    setLoading(true);
    try {
      await orderService.markReachedVendor();
      await updateCurrentOfferWithPreservedPayment('Reached Vendor');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPickupOtp = async (otp: string) => {
    setLoading(true);
    setOtpError('');
    try {
      const valid = await orderService.verifyPickupOtp(otp);
      if (valid || otp === (currentOrderObj.vendor.pickupOtp || '3431')) {
        await updateCurrentOfferWithPreservedPayment('Pickup OTP Verified');
      } else {
        setOtpError(`Invalid Pickup OTP. Please enter code ${currentOrderObj.vendor.pickupOtp || '3431'}.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPickup = async () => {
    setLoading(true);
    try {
      await orderService.confirmPickup();
      await updateCurrentOfferWithPreservedPayment('out_for_delivery');
    } finally {
      setLoading(false);
    }
  };

  const handleReachedCustomer = async () => {
    setLoading(true);
    try {
      await orderService.markReachedCustomer();
      await updateCurrentOfferWithPreservedPayment('Reached Customer');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDeliveryOtp = async (otp: string) => {
    setLoading(true);
    setOtpError('');
    try {
      const valid = await orderService.verifyDeliveryOtp(otp);
      if (valid || otp === (currentOrderObj.customer.deliveryOtp || '3221')) {
        await updateCurrentOfferWithPreservedPayment('Delivery OTP Verified');
      } else {
        setOtpError(`Invalid Delivery OTP. Please enter code ${currentOrderObj.customer.deliveryOtp || '3221'}.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteDelivery = async () => {
    setLoading(true);
    try {
      await orderService.completeDelivery();
      if (currentOrderObj) {
        useAppStore.setState({ currentOrder: { ...currentOrderObj, status: 'Delivered' } });
      }
      navigate('/app/orders/success');
    } finally {
      setLoading(false);
    }
  };

  const isFoodOrder = Boolean(
    currentOrderObj.orderType === 'FOOD' ||
    (currentOrderObj.category && (
      currentOrderObj.category.toLowerCase().includes('food') ||
      currentOrderObj.category.toLowerCase().includes('dining') ||
      currentOrderObj.category.toLowerCase().includes('biryani') ||
      currentOrderObj.category.toLowerCase().includes('restaurant')
    )) ||
    (currentOrderObj.vendor?.name && (
      currentOrderObj.vendor.name.toLowerCase().includes('restaurant') ||
      currentOrderObj.vendor.name.toLowerCase().includes('kitchen') ||
      currentOrderObj.vendor.name.toLowerCase().includes('cafe') ||
      currentOrderObj.vendor.name.toLowerCase().includes('bakery')
    ))
  );

  const isFoodPickupPhase = isFoodOrder && !['Out for Delivery', 'out_for_delivery', 'Picked Up', 'picked_up', 'Reached Customer', 'Delivery OTP Verified', 'Delivered', 'Completed'].includes(status);
  const isFoodDeliveryPhase = isFoodOrder && ['Out for Delivery', 'out_for_delivery', 'Picked Up', 'picked_up', 'Reached Customer', 'Delivery OTP Verified'].includes(status);

  const isRetailStage1 = !isFoodOrder && ['Accepted', 'accepted', 'Assigned', 'assigned', 'pending', 'Placed', 'placed'].includes(status);
  const isRetailStage2 = !isFoodOrder && ['Reached Vendor', 'Pickup OTP Verified'].includes(status);
  const isRetailStage3 = !isFoodOrder && ['Picked Up', 'picked_up', 'Out for Delivery', 'out_for_delivery', 'Shipped'].includes(status);
  const isRetailStage4 = !isFoodOrder && ['Reached Customer', 'Delivery OTP Verified'].includes(status);

  const codAmount = currentOrderObj.codAmount ?? 36.00;

  const vendorAddress = currentOrderObj.vendor?.address || 'Palodi Road, Adilabad, Telangana - 504312';

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header Info */}
      <div className="flex justify-between items-center bg-white border border-[#E5E7EB] rounded-2xl p-4 sm:p-5 shadow-xs">
        <div>
          <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider block">
            {isFoodOrder ? '🍔 Food & Dining Order Delivery' : '📦 Retail Package Delivery'}
          </span>
          <h2 className="text-lg font-extrabold text-[#171717] mt-0.5">{currentOrderObj.orderNumber}</h2>
        </div>
        <OrderStatusBadge status={status} />
      </div>

      {/* Progress Stepper */}
      <DeliveryProgressStepper currentStatus={status} isFoodOrder={isFoodOrder} />

      {/* Real-time Kitchen Status Banner (For Food & Dining Orders) */}
      {isFoodOrder && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between shadow-xs ${['ready_for_pickup', 'Ready', 'Packed', 'out_for_delivery', 'Out for Delivery'].includes(status)
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
          <div className="flex items-center space-x-3">
            {['ready_for_pickup', 'Ready', 'Packed', 'out_for_delivery', 'Out for Delivery'].includes(status) ? (
              <UtensilsCrossed className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <Flame className="w-5 h-5 text-amber-500 animate-pulse shrink-0" />
            )}
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider block opacity-75">Restaurant Kitchen Live Status</span>
              <span className="text-xs font-black">
                {['out_for_delivery', 'Out for Delivery', 'Picked Up'].includes(status)
                  ? '🚴 Food Handed Over — Rider is Heading to Customer'
                  : ['ready_for_pickup', 'Ready', 'Packed'].includes(status)
                    ? '🍲 Order Cooked & Ready for Pickup at Restaurant!'
                    : '🔥 Chef is Currently Preparing Food in Kitchen'}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white border font-mono shrink-0">
            Live Auto-Sync
          </span>
        </div>
      )}

      {/* FOOD ORDER - PHASE 1: HEADING TO RESTAURANT & PICKUP OTP */}
      {isFoodPickupPhase && (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs">
          <div className="flex justify-between items-start border-b border-[#E5E7EB] pb-4">
            <div>
              <span className="text-xs font-bold text-[#16A34A] uppercase tracking-wider block">
                Restaurant Pickup Location
              </span>
              <h3 className="text-xl font-extrabold text-[#171717] mt-0.5">{currentOrderObj.vendor.name || 'Palodi Kitchen & Restaurant'}</h3>
              <p className="text-xs text-[#6B7280] font-medium mt-1">{vendorAddress}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-[#6B7280] font-semibold block">Pickup Distance</span>
              <span className="text-base font-extrabold text-[#171717]">{currentOrderObj.vendor.pickupDistanceKm} km</span>
              <span className="text-[11px] text-[#6B7280] block mt-0.5">Est. {currentOrderObj.vendor.estimatedArrivalMins} mins</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <CallAction phone={currentOrderObj.vendor.phone} label="Call Merchant" />
            <NavigationAction address={vendorAddress} label="Open Pickup Route" />
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2 text-center">
            <span className="text-xs font-bold text-amber-900 block">
              Rider Verification Pickup OTP (Show to Restaurant Merchant):
            </span>
            <div className="text-2xl font-black text-amber-700 tracking-widest font-mono">
              {currentOrderObj.vendor.pickupOtp || '3431'}
            </div>
            <p className="text-[11px] text-amber-800 font-medium">
              Provide this code to restaurant staff so they verify your assignment and hand over the meal.
            </p>
          </div>

          <PrimaryDeliveryAction
            label="Picked Up Food & Start Delivery"
            onClick={handleConfirmPickup}
            loading={loading}
          />
        </div>
      )}

      {/* RETAIL STAGE 1: HEADING TO VENDOR STORE LOCATION */}
      {isRetailStage1 && (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs">
          <div className="flex justify-between items-start border-b border-[#E5E7EB] pb-4">
            <div>
              <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider block">
                Vendor Store Pickup Location
              </span>
              <h3 className="text-xl font-extrabold text-[#171717] mt-0.5">{currentOrderObj.vendor.name}</h3>
              <p className="text-xs text-[#6B7280] font-medium mt-1">{vendorAddress}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-[#6B7280] font-semibold block">Pickup Distance</span>
              <span className="text-base font-extrabold text-[#171717]">{currentOrderObj.vendor.pickupDistanceKm} km</span>
              <span className="text-[11px] text-[#6B7280] block mt-0.5">Est. {currentOrderObj.vendor.estimatedArrivalMins} mins</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <CallAction phone={currentOrderObj.vendor.phone} label="Call Merchant" />
            <NavigationAction address={vendorAddress} label="Open Pickup Route" />
          </div>

          <PrimaryDeliveryAction
            label="I Have Reached Vendor / Store Location"
            onClick={handleReachedVendor}
            loading={loading}
          />
        </div>
      )}

      {/* RETAIL STAGE 2: REACHED VENDOR / PICKUP OTP VERIFICATION */}
      {isRetailStage2 && (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs">
          <div className="border-b border-[#E5E7EB] pb-4">
            <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider block">
              Vendor Store Handoff
            </span>
            <h3 className="text-xl font-extrabold text-[#171717] mt-0.5">{currentOrderObj.vendor.name}</h3>
            <p className="text-xs text-[#6B7280] mt-0.5">Verify 4-digit merchant pickup OTP code to collect packages.</p>
          </div>

          {status === 'Reached Vendor' ? (
            <div className="space-y-4 text-center">
              <span className="text-xs font-bold text-[#171717] block">
                Enter Merchant Pickup OTP (OTP: {currentOrderObj.vendor.pickupOtp || '3431'})
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

      {/* CUSTOMER DELIVERY PHASE (Food Delivery & Retail Stage 3 & Stage 4) */}
      {(isFoodDeliveryPhase || isRetailStage3 || isRetailStage4) && (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs">
          <div className="flex justify-between items-start border-b border-[#E5E7EB] pb-4">
            <div>
              <span className="text-xs font-bold text-[#F59E0B] uppercase tracking-wider block">
                Customer Delivery Dropoff Location
              </span>
              <h3 className="text-xl font-extrabold text-[#171717] mt-0.5">{currentOrderObj.customer.name}</h3>
              <p className="text-xs text-[#6B7280] font-medium mt-1">{currentOrderObj.customer.address}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-[#6B7280] font-semibold block">Delivery Distance</span>
              <span className="text-base font-extrabold text-[#171717]">{currentOrderObj.customer.deliveryDistanceKm} km</span>
              <span className="text-[11px] text-[#6B7280] block mt-0.5">Est. {currentOrderObj.customer.estimatedArrivalMins} mins</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <CallAction phone={currentOrderObj.customer.phone} label="Call Customer" />
            <NavigationAction address={currentOrderObj.customer.address} label="Open Dropoff Route" />
          </div>

          {currentOrderObj.paymentType === 'Prepaid' || currentOrderObj.paymentType === 'Paid' || currentOrderObj.codCollected ? (
            <div className="p-4 bg-emerald-50 border-2 border-emerald-500 rounded-2xl flex items-center justify-between text-emerald-900 shadow-xs">
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-xs font-black uppercase text-emerald-800 block">Payment Status: PAID</span>
                  <span className="text-[11px] text-emerald-700 font-semibold block">
                    {currentOrderObj.paymentType === 'Prepaid' ? 'Online Prepaid (No cash collection required)' : `COD Collected via ${currentOrderObj.codPaymentMethod || 'UPI/Cash'}`}
                  </span>
                </div>
              </div>
              <span className="font-mono font-black text-emerald-700 text-sm">PAID ✅</span>
            </div>
          ) : (
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

              <button
                onClick={() => setShowScannerModal(true)}
                className="w-full py-3 bg-[#171717] hover:bg-neutral-800 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <QrCode className="h-4 w-4 text-[#F5B800]" />
                <span>Collect Payment (Show/Scan UPI QR or Cash)</span>
              </button>
            </div>
          )}

          {status === 'Reached Customer' ? (
            <div className="space-y-4 text-center">
              <span className="text-xs font-bold text-[#171717] block">
                Enter Customer Delivery OTP (OTP: {currentOrderObj.customer.deliveryOtp || '3221'})
              </span>
              <OtpInput onComplete={handleVerifyDeliveryOtp} error={otpError} disabled={loading} />
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-[#16A34A] font-semibold inline-flex items-center space-x-1.5">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>Customer receives OTP on their registered mobile app</span>
              </div>
            </div>
          ) : status === 'Delivery OTP Verified' ? (
            <div className="pt-2">
              <PrimaryDeliveryAction
                label="Complete Delivery"
                onClick={handleCompleteDelivery}
                loading={loading}
                variant="success"
              />
            </div>
          ) : (
            <PrimaryDeliveryAction
              label="I Have Reached Customer Address"
              onClick={handleReachedCustomer}
              loading={loading}
            />
          )}
        </div>
      )}

      {/* COD Payment Scanner Modal */}
      <CodPaymentScannerModal
        isOpen={showScannerModal}
        onClose={() => setShowScannerModal(false)}
        orderNumber={currentOrderObj.orderNumber}
        amount={codAmount}
        customerName={currentOrderObj.customer.name}
        onPaymentConfirmed={async (method) => {
          await orderService.confirmCodPayment(method);
          if (currentOrderObj) {
            useAppStore.setState({
              currentOrder: {
                ...currentOrderObj,
                codCollected: true,
                codPaymentMethod: method
              }
            });
          }
        }}
      />
    </div>
  );
};


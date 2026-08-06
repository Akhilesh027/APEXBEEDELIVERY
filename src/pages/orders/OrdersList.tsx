import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { orderService } from '../../services/orderService';
import { PageHeader } from '../../components/common/PageHeader';
import { OrderStatusBadge } from '../../components/orders/OrderStatusBadge';
import { MapPin, DollarSign, ChevronRight, X, CheckCircle2, ShoppingBag } from 'lucide-react';
import { useNavigate } from '../../app/simpleRouter';
import type { OrderOffer } from '../../types/order';

export const OrdersListPage: React.FC = () => {
  const { orderHistory, currentOrder } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [selectedDeliveredOrder, setSelectedDeliveredOrder] = useState<OrderOffer | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    orderService.getOrderHistory().then((history) => {
      if (history && history.length > 0) {
        useAppStore.setState({ orderHistory: history });
      }
    }).finally(() => setLoading(false));
  }, []);

  const allOrders = currentOrder ? [currentOrder, ...orderHistory] : orderHistory;

  return (
    <div className="space-y-6 text-left font-sans">
      <PageHeader title="Orders & Assignments Roster" subtitle="All completed and active delivery tasks" />

      <div className="space-y-4">
        {loading && allOrders.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#6B7280]">
            Fetching assigned orders from backend...
          </div>
        ) : allOrders.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#6B7280]">
            No order assignments found.
          </div>
        ) : (
          allOrders.map((order, idx) => (
            <div
              key={order.orderId || idx}
              onClick={() => {
                if (order.status !== 'Delivered' && order.status !== 'Completed') {
                  navigate(`/app/orders/active/${order.orderId}`);
                } else {
                  setSelectedDeliveredOrder(order);
                }
              }}
              className="bg-white border border-[#E5E7EB] rounded-2xl p-4 sm:p-5 shadow-xs hover:border-neutral-400 transition-all cursor-pointer space-y-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-[#F59E0B] uppercase tracking-wider block">
                    #{order.orderNumber}
                  </span>
                  <h4 className="font-extrabold text-[#171717] text-base mt-0.5">{order.vendor?.name || 'GNS Stores'}</h4>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#6B7280]">
                <div className="flex items-center space-x-1.5">
                  <MapPin className="h-3.5 w-3.5 text-[#16A34A] shrink-0" />
                  <span className="truncate">{order.customer?.address || 'Palodi, Adilabad'}</span>
                </div>
                <div className="flex items-center space-x-1.5 sm:justify-end">
                  <DollarSign className="h-3.5 w-3.5 text-[#F5B800] shrink-0" />
                  <span className="font-extrabold text-[#171717]">Earnings: ₹{(order.estimatedEarnings || 72.0).toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs border-t border-[#E5E7EB] pt-2.5">
                <span className="text-[#6B7280] font-medium">Delivered at: {order.deliveredAt || 'Completed Task'}</span>
                <button
                  type="button"
                  className="font-extrabold text-[#2563EB] flex items-center space-x-1 hover:underline cursor-pointer"
                >
                  <span>View Details</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* DELIVERED ORDER DETAILS MODAL */}
      {selectedDeliveredOrder && (
        <div className="fixed inset-0 bg-neutral-900/75 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-[#E5E7EB] rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-[#E5E7EB] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-black text-[10px] uppercase flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    Delivered & Verified
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-[#171717] mt-1">
                  Order #{selectedDeliveredOrder.orderNumber}
                </h3>
              </div>

              <button
                onClick={() => setSelectedDeliveredOrder(null)}
                className="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-full transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Vendor & Store Information */}
            <div className="bg-[#F7F7F5] border border-[#E5E7EB] rounded-2xl p-4 space-y-3 text-xs">
              <div className="flex items-start space-x-2.5">
                <ShoppingBag className="h-4 w-4 text-[#2563EB] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-[#6B7280] font-bold uppercase block">Merchant Store Pickup</span>
                  <strong className="text-sm font-extrabold text-[#171717] block">
                    {selectedDeliveredOrder.vendor?.name || 'GNS Stores'}
                  </strong>
                  <span className="text-[#6B7280] leading-tight block mt-0.5">
                    📍 {(selectedDeliveredOrder.vendor?.address && !selectedDeliveredOrder.vendor.address.toLowerCase().includes('lb nagar'))
                        ? selectedDeliveredOrder.vendor.address
                        : 'NH67, బుచ్చిరెడ్డిపాలెం, Sri Potti Sriramulu Nellore, Andhra Pradesh, 524305, India'}
                  </span>
                  <span className="text-neutral-500 font-mono block mt-1">
                    📞 {selectedDeliveredOrder.vendor?.phone || '9177176969'}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer & Delivery Address */}
            <div className="bg-[#F7F7F5] border border-[#E5E7EB] rounded-2xl p-4 space-y-3 text-xs">
              <div className="flex items-start space-x-2.5">
                <MapPin className="h-4 w-4 text-[#16A34A] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-[#6B7280] font-bold uppercase block">Customer Dropoff Address</span>
                  <strong className="text-sm font-extrabold text-[#171717] block">
                    {selectedDeliveredOrder.customer?.name || 'Akhilesh Reddy'}
                  </strong>
                  <span className="text-[#6B7280] leading-tight block mt-0.5">
                    📍 {selectedDeliveredOrder.customer?.address || 'Palodi, Adilabad, Telangana, 504312'}
                  </span>
                  <span className="text-neutral-500 font-mono block mt-1">
                    📞 {selectedDeliveredOrder.customer?.phone || '9707010797'}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment & Earnings Breakdown Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl">
                <span className="text-[10px] text-emerald-700 font-bold block uppercase">Rider Payout</span>
                <span className="text-base font-extrabold text-emerald-700 block mt-0.5">
                  ₹{(selectedDeliveredOrder.estimatedEarnings || 72.0).toFixed(2)}
                </span>
                <span className="text-[9px] text-emerald-600 font-sans block mt-0.5">Credited to Rider Wallet</span>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-3 rounded-2xl">
                <span className="text-[10px] text-blue-700 font-bold block uppercase">Payment Mode</span>
                <span className="text-base font-extrabold text-blue-700 block mt-0.5">
                  {selectedDeliveredOrder.paymentType || 'COD'}
                </span>
                <span className="text-[9px] text-blue-600 font-sans block mt-0.5">
                  {selectedDeliveredOrder.paymentType === 'COD' ? `Amount: ₹${selectedDeliveredOrder.codAmount || 150}` : 'Online Prepaid'}
                </span>
              </div>
            </div>

            {/* Delivered Verification Metadata */}
            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-neutral-500 font-bold">Category:</span>
                <span className="font-extrabold text-neutral-800">{selectedDeliveredOrder.category || 'Fresh & Premium Grade'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 font-bold">Total Packages:</span>
                <span className="font-extrabold text-neutral-800">{selectedDeliveredOrder.packageCount || 1} Bags</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 font-bold">Delivery Completion:</span>
                <span className="font-mono font-bold text-neutral-800">{selectedDeliveredOrder.deliveredAt || 'Completed'}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedDeliveredOrder(null)}
              className="w-full py-3 bg-neutral-900 hover:bg-black text-white font-extrabold text-xs rounded-2xl transition cursor-pointer"
            >
              Close Details View
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersListPage;

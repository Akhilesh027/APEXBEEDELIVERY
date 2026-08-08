import type { OrderOffer } from '../types/order';
import { useAppStore } from '../store/useAppStore';
import { apiClient } from './apiClient';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface OrderService {
  getCurrentOffer(): Promise<OrderOffer | null>;
  acceptOffer(orderId?: string): Promise<boolean>;
  rejectOffer(reason: string): Promise<void>;
  markReachedVendor(): Promise<void>;
  verifyPickupOtp(otp: string): Promise<boolean>;
  confirmPickup(): Promise<void>;
  markReachedCustomer(): Promise<void>;
  verifyDeliveryOtp(otp: string): Promise<boolean>;
  confirmCodPayment(method: 'Cash' | 'UPI'): Promise<void>;
  completeDelivery(): Promise<void>;
  getOrderHistory(): Promise<OrderOffer[]>;
}

export const mockOrderService: OrderService = {
  async getCurrentOffer(): Promise<OrderOffer | null> {
    await delay(300);
    return useAppStore.getState().activeOffer;
  },

  async acceptOffer(): Promise<boolean> {
    await delay(500);
    return useAppStore.getState().acceptOffer();
  },

  async rejectOffer(reason: string): Promise<void> {
    await delay(400);
    useAppStore.getState().rejectOffer(reason);
  },

  async markReachedVendor(): Promise<void> {
    await delay(450);
    useAppStore.getState().markReachedVendor();
  },

  async verifyPickupOtp(otp: string): Promise<boolean> {
    await delay(500);
    return useAppStore.getState().verifyPickupOtp(otp);
  },

  async confirmPickup(): Promise<void> {
    await delay(400);
    useAppStore.getState().confirmPickup();
  },

  async markReachedCustomer(): Promise<void> {
    await delay(450);
    useAppStore.getState().markReachedCustomer();
  },

  async verifyDeliveryOtp(otp: string): Promise<boolean> {
    await delay(500);
    return useAppStore.getState().verifyDeliveryOtp(otp);
  },

  async confirmCodPayment(method: 'Cash' | 'UPI'): Promise<void> {
    await delay(400);
    useAppStore.getState().confirmCodPayment(method);
  },

  async completeDelivery(): Promise<void> {
    await delay(600);
    useAppStore.getState().completeDelivery();
  },

  async getOrderHistory(): Promise<OrderOffer[]> {
    await delay(350);
    return useAppStore.getState().orderHistory;
  }
};

function parseCustomerAddress(ordObj: any, assigned: any): string {
  if (typeof ordObj?.shippingAddress === 'string') return ordObj.shippingAddress;
  if (typeof ordObj?.deliveryAddress === 'string' && ordObj.deliveryAddress) return ordObj.deliveryAddress;
  const sa = ordObj?.shippingAddress || {};
  const parts = [
    sa.addressLine1 || sa.addressText || sa.address || sa.houseNumber || sa.doorNo,
    sa.addressLine2 || sa.street || sa.landmark,
    sa.city || sa.district || sa.mandal,
    sa.state,
    sa.pincode ? String(sa.pincode) : null
  ].filter(Boolean);
  if (parts.length > 0) return parts.join(', ');
  if (assigned?.customerId?.address) return String(assigned.customerId.address);
  return 'Palodi, Adilabad, Telangana - 504312';
}

function parseVendorAddress(ordObj: any, assigned: any): string {
  const DEFAULT_ADDRESS = 'Palodi Road, Adilabad, Telangana - 504312';
  const v = assigned?.vendorId || ordObj?.sellerId || {};
  if (typeof v === 'string') return DEFAULT_ADDRESS;
  if (v.address) return String(v.address);
  if (v.storeAddress) return String(v.storeAddress);
  const parts = [
    v.addressText || v.location,
    v.locality,
    v.mandal || v.city || 'Palodi',
    v.district || 'Adilabad',
    v.state || 'Telangana',
    v.pincode ? String(v.pincode) : '504312'
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : DEFAULT_ADDRESS;
}

function getUrlOrderId(): string | null {
  if (typeof window !== 'undefined') {
    const parts = window.location.pathname.split('/');
    const last = parts[parts.length - 1];
    if (last && last !== 'active' && last.length > 5) return last;
  }
  return null;
}

export const apiOrderService: OrderService = {
  async getCurrentOffer(): Promise<OrderOffer | null> {
    try {
      const res = await apiClient.get('/orders');
      const assignments = res.data.assignments || [];

      // Check if there is an active order already accepted or in progress
      const activeAssigned = assignments.find((a: any) => {
        const ordObj = typeof a.orderId === 'object' ? a.orderId : null;
        const st = ordObj?.orderStatus || a.status || a.orderStatus || '';
        return ['Accepted', 'accepted', 'ready_for_pickup', 'Ready', 'Packed', 'Reached Vendor', 'Pickup OTP Verified', 'Picked Up', 'picked_up', 'Out for Delivery', 'out_for_delivery', 'Reached Customer', 'Delivery OTP Verified', 'Shipped'].includes(st);
      });

      if (activeAssigned) {
        const ordObj = typeof activeAssigned.orderId === 'object' ? activeAssigned.orderId : null;
        const ordId = ordObj?._id || activeAssigned.orderId || activeAssigned._id;
        const rawStatus = ordObj?.orderStatus || activeAssigned.status || 'Accepted';
        const isFoodType = Boolean(
          ordObj?.orderType === 'FOOD' ||
          ordObj?.items?.[0]?.productName?.toLowerCase().includes('biryani') ||
          ordObj?.items?.[0]?.name?.toLowerCase().includes('biryani') ||
          activeAssigned.vendorId?.restaurantName
        );
        const activeOrder: OrderOffer = {
          orderId: String(ordId),
          orderNumber: ordObj?.orderNumber || activeAssigned.orderNumber || 'AB-1785932178923-4753',
          orderType: isFoodType ? 'FOOD' : 'RETAIL',
          vendor: {
            id: String(activeAssigned.vendorId?._id || '6a732d3aa68240482a1fd223'),
            name: activeAssigned.vendorId?.businessName || activeAssigned.vendorId?.ownerName || 'GNS Stores',
            address: parseVendorAddress(ordObj, activeAssigned),
            phone: activeAssigned.vendorId?.mobile || activeAssigned.vendorId?.phone || '9177176969',
            pickupDistanceKm: 1.4,
            estimatedArrivalMins: 6,
            pickupOtp: String(ordObj?.pickupVerification?.otp || '3431')
          },
          customer: {
            id: String(activeAssigned.customerId?._id || 'customer_001'),
            name: ordObj?.shippingAddress?.recipientName || ordObj?.shippingAddress?.name || activeAssigned.customerId?.name || 'Akhilesh Reddy',
            phone: ordObj?.shippingAddress?.phone || activeAssigned.customerId?.phone || '9707010797',
            address: parseCustomerAddress(ordObj, activeAssigned),
            deliveryDistanceKm: 4.8,
            estimatedArrivalMins: 22,
            deliveryOtp: String(ordObj?.deliveryVerification?.otp || '3221')
          },
          paymentType: (ordObj?.paymentMethod === 'COD' || ordObj?.paymentDetails?.method === 'cod' || ordObj?.paymentStatus === 'Pending') ? 'COD' : 'Prepaid',
          codAmount: ordObj?.totalAmount || ordObj?.orderSummary?.total || 36.00,
          codCollected: Boolean(ordObj?.codCollected || ordObj?.paymentStatus === 'Paid' || ordObj?.isPaid),
          codPaymentMethod: ordObj?.codPaymentMethod || ordObj?.paymentDetails?.method || 'UPI',
          category: isFoodType
            ? 'Food & Dining'
            : (ordObj?.items?.[0]?.productName || ordObj?.items?.[0]?.name || 'Retail Product Delivery'),
          packageCount: ordObj?.items?.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0) || 1,
          estimatedTotalTimeMins: 25,
          estimatedEarnings: Math.max(55.0, Math.round(35 + (1.4 + 4.8) * 6)),
          expiresInSeconds: 0,
          status: rawStatus
        };
        useAppStore.setState({ currentOrder: activeOrder });
        return activeOrder;
      }

      // Find any assignment explicitly assigned to this rider waiting for acceptance
      const pendingAssigned = assignments.find(
        (a: any) => a.status === 'Assigned'
      );

      if (!pendingAssigned) return null;

      const ordObj = typeof pendingAssigned.orderId === 'object' ? pendingAssigned.orderId : null;
      const ordId = ordObj?._id || pendingAssigned.orderId || pendingAssigned._id;

      const pickupOtp = ordObj?.pickupVerification?.otp || '3431';
      const deliveryOtp = ordObj?.deliveryVerification?.otp || '3221';

      const customerName =
        ordObj?.shippingAddress?.recipientName ||
        ordObj?.shippingAddress?.name ||
        pendingAssigned.customerId?.name ||
        'Akhilesh Reddy';
      const customerPhone =
        ordObj?.shippingAddress?.phone || pendingAssigned.customerId?.phone || '9707010797';
      const customerAddr = parseCustomerAddress(ordObj, pendingAssigned);

      const vendorName =
        pendingAssigned.vendorId?.businessName ||
        pendingAssigned.vendorId?.ownerName ||
        pendingAssigned.vendorId?.name ||
        'GNS Stores';
      const vendorPhone = pendingAssigned.vendorId?.mobile || pendingAssigned.vendorId?.phone || '9177176969';
      const vendorAddr = parseVendorAddress(ordObj, pendingAssigned);

      return {
        orderId: String(ordId),
        orderNumber: ordObj?.orderNumber || pendingAssigned.orderNumber || 'AB-1785932178923-4753',
        vendor: {
          id: String(pendingAssigned.vendorId?._id || 'vendor_001'),
          name: vendorName,
          address: vendorAddr,
          phone: vendorPhone,
          pickupDistanceKm: 1.4,
          estimatedArrivalMins: 6,
          pickupOtp: String(pickupOtp)
        },
        customer: {
          id: String(pendingAssigned.customerId?._id || 'customer_001'),
          name: customerName,
          phone: customerPhone,
          address: customerAddr,
          deliveryDistanceKm: 4.8,
          estimatedArrivalMins: 22,
          deliveryOtp: String(deliveryOtp)
        },
        paymentType: (ordObj?.paymentMethod === 'COD' || ordObj?.paymentDetails?.method === 'cod' || ordObj?.paymentStatus === 'Pending') ? 'COD' : 'Prepaid',
        codAmount: ordObj?.totalAmount || ordObj?.orderSummary?.total || 150,
        category: (ordObj?.items?.[0]?.productName?.toLowerCase().includes('biryani') || ordObj?.items?.[0]?.name?.toLowerCase().includes('biryani') || ordObj?.orderType === 'FOOD' || pendingAssigned.vendorId?.restaurantName)
          ? 'Food & Dining'
          : (ordObj?.items?.[0]?.productName || ordObj?.items?.[0]?.name || 'Retail Product Delivery'),
        packageCount: ordObj?.items?.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0) || 1,
        estimatedTotalTimeMins: 25,
        estimatedEarnings: (ordObj?.orderSummary?.shippingFee && ordObj.orderSummary.shippingFee > 20)
          ? ordObj.orderSummary.shippingFee
          : Math.max(55.0, Math.round(35 + (1.4 + 4.8) * 6)),
        expiresInSeconds: 0,
        status: pendingAssigned.status || 'Assigned'
      };
    } catch (err) {
      console.error('[OrderService] getCurrentOffer failed:', err);
      // NEVER fall back to mock/stale data — return null so only assigned orders appear
      return null;
    }
  },

  async acceptOffer(orderId?: string): Promise<boolean> {
    const current = useAppStore.getState().activeOffer || useAppStore.getState().currentOrder;
    const targetId = orderId || current?.orderId;
    if (!targetId) return false;

    try {
      await apiClient.post(`/orders/${targetId}/accept`);
    } catch (err) {
      console.warn('[OrderService] Accept API call warning:', err);
    }
    return useAppStore.getState().acceptOffer();
  },

  async rejectOffer(reason: string): Promise<void> {
    const current = useAppStore.getState().currentOrder || useAppStore.getState().activeOffer;
    if (current) {
      try {
        await apiClient.post(`/orders/${current.orderId}/reject`, { reason });
      } catch {}
    }
    useAppStore.getState().rejectOffer(reason);
  },

  async markReachedVendor(): Promise<void> {
    const current = useAppStore.getState().currentOrder;
    const targetId = current?.orderId || getUrlOrderId();
    if (targetId) {
      try {
        await apiClient.post(`/orders/${targetId}/reached-pickup`);
      } catch {}
    }
    useAppStore.getState().markReachedVendor();
  },

  async verifyPickupOtp(otp: string): Promise<boolean> {
    const current = useAppStore.getState().currentOrder;
    const targetId = current?.orderId || getUrlOrderId();
    if (targetId) {
      try {
        await apiClient.post(`/orders/${targetId}/pickup`, { otp });
      } catch {}
    }
    return useAppStore.getState().verifyPickupOtp(otp);
  },

  async confirmPickup(): Promise<void> {
    const current = useAppStore.getState().currentOrder;
    const targetId = current?.orderId || getUrlOrderId();
    if (targetId) {
      try {
        await apiClient.post(`/orders/${targetId}/out-for-delivery`);
        await apiClient.post(`/orders/${targetId}/pickup`);
      } catch {}
    }
    useAppStore.getState().confirmPickup();
  },

  async markReachedCustomer(): Promise<void> {
    const current = useAppStore.getState().currentOrder;
    const targetId = current?.orderId || getUrlOrderId();
    if (targetId) {
      try {
        await apiClient.post(`/orders/${targetId}/reached-customer`);
      } catch {}
    }
    useAppStore.getState().markReachedCustomer();
  },

  async verifyDeliveryOtp(otp: string): Promise<boolean> {
    const current = useAppStore.getState().currentOrder;
    const targetId = current?.orderId || getUrlOrderId();
    if (targetId) {
      try {
        await apiClient.post(`/orders/${targetId}/delivered`, { otp });
      } catch {}
    }
    return useAppStore.getState().verifyDeliveryOtp(otp);
  },

  async confirmCodPayment(method: 'Cash' | 'UPI'): Promise<void> {
    const current = useAppStore.getState().currentOrder;
    const targetId = current?.orderId || getUrlOrderId();
    if (targetId) {
      try {
        await apiClient.post(`/orders/${targetId}/cod-payment`, { method, amount: current?.codAmount || current?.estimatedEarnings || 150 });
      } catch {}
    }
    useAppStore.getState().confirmCodPayment(method);
  },

  async completeDelivery(): Promise<void> {
    const current = useAppStore.getState().currentOrder;
    const targetId = current?.orderId || getUrlOrderId();
    if (targetId) {
      try {
        await apiClient.post(`/orders/${targetId}/delivered`, {
          otp: current?.customer?.deliveryOtp || '3221',
          deliveryNote: 'Delivered directly to customer'
        });
      } catch {}
    }
    useAppStore.getState().completeDelivery();
  },

  async getOrderHistory(): Promise<OrderOffer[]> {
    try {
      const res = await apiClient.get('/orders');
      if (res.data && res.data.assignments) {
        return res.data.assignments.map((a: any) => {
          const ordObj = typeof a.orderId === 'object' ? a.orderId : null;
          const totalKm = 1.4 + 4.8;
          const calculatedPay = (ordObj?.orderSummary?.shippingFee && ordObj.orderSummary.shippingFee > 20)
            ? ordObj.orderSummary.shippingFee
            : Math.max(68.0, Math.round(35 + totalKm * 7.5));

          return {
            orderId: String(ordObj?._id || a.orderId || a._id),
            orderNumber: ordObj?.orderNumber || a.orderNumber || 'AB-1785932178923-4753',
            vendor: {
              id: String(a.vendorId?._id || '6a732d3aa68240482a1fd223'),
              name: a.vendorId?.businessName || a.vendorId?.ownerName || 'GNS Stores',
              address: parseVendorAddress(ordObj, a),
              phone: a.vendorId?.mobile || a.vendorId?.phone || '9177176969',
              pickupDistanceKm: 1.4,
              estimatedArrivalMins: 6,
              pickupOtp: String(ordObj?.pickupVerification?.otp || '3431')
            },
            customer: {
              id: String(a.customerId?._id || 'customer_001'),
              name: ordObj?.shippingAddress?.recipientName || ordObj?.shippingAddress?.name || a.customerId?.name || 'Akhilesh Reddy',
              phone: ordObj?.shippingAddress?.phone || a.customerId?.phone || '9707010797',
              address: parseCustomerAddress(ordObj, a),
              deliveryDistanceKm: 4.8,
              estimatedArrivalMins: 22,
              deliveryOtp: String(ordObj?.deliveryVerification?.otp || '3221')
            },
            paymentType: (ordObj?.paymentMethod === 'COD' || ordObj?.paymentDetails?.method === 'cod' || ordObj?.paymentStatus === 'Pending') ? 'COD' : 'Prepaid',
            codAmount: ordObj?.totalAmount || ordObj?.orderSummary?.total || 150,
            category: ordObj?.items?.[0]?.productName || ordObj?.items?.[0]?.name || 'Test2 - Fresh & Premium Grade',
            packageCount: ordObj?.items?.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0) || 1,
            estimatedTotalTimeMins: 25,
            estimatedEarnings: calculatedPay,
            expiresInSeconds: 0,
            status: a.status
          };
        });
      }
    } catch (err) {
      console.error('[OrderService] getOrderHistory failed:', err);
    }
    // NEVER fall back to stale localStorage mock orders — return empty so only this partner's real delivered orders show
    return [];
  }
};

export const orderService: OrderService = apiOrderService;

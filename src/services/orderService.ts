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
    sa.mandal || sa.city || sa.district,
    sa.district && sa.district !== sa.mandal ? sa.district : null,
    sa.state || 'Telangana',
    sa.pincode ? String(sa.pincode) : null
  ].filter(Boolean);
  if (parts.length > 0) return parts.join(', ');
  if (assigned?.customerId?.address) return String(assigned.customerId.address);
  return 'Tamsi, Adilabad, Telangana - 504312';
}

function parseVendorAddress(ordObj: any, assigned: any): string {
  const DEFAULT_ADDRESS = 'Tamsi Road, Adilabad, Telangana - 504312';
  const v = assigned?.vendorId || ordObj?.sellerId || {};
  if (typeof v === 'string') return DEFAULT_ADDRESS;
  if (v.address) return String(v.address);
  if (v.storeAddress) return String(v.storeAddress);
  const parts = [
    v.addressText || v.location,
    v.locality,
    v.mandal || v.city || 'Tamsi',
    v.district || 'Adilabad',
    v.state || 'Telangana',
    v.pincode ? String(v.pincode) : '504312'
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : DEFAULT_ADDRESS;
}

function getUrlOrderId(): string | null {
  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname.split('?')[0];
    const parts = pathname.split('/').filter(Boolean);
    const last = parts[parts.length - 1];
    if (last && last !== 'active' && last.length >= 8) {
      return last.trim();
    }
  }
  return null;
}

export function extractShippingFee(ordObj: any, assignment?: any): number {
  const fee =
    ordObj?.orderSummary?.shippingFee ??
    ordObj?.shippingFee ??
    ordObj?.deliveryFee ??
    ordObj?.deliveryCharge ??
    ordObj?.shippingCharges ??
    assignment?.shippingFee ??
    assignment?.deliveryFee ??
    assignment?.orderSummary?.shippingFee ??
    assignment?.orderId?.orderSummary?.shippingFee ??
    assignment?.orderId?.shippingFee;

  if (typeof fee === 'number' && !isNaN(fee) && fee >= 0) {
    return fee;
  }
  if (typeof fee === 'string' && !isNaN(parseFloat(fee))) {
    return parseFloat(fee);
  }
  return 0;
}

export const apiOrderService: OrderService = {
  async getCurrentOffer(): Promise<OrderOffer | null> {
    try {
      const urlId = getUrlOrderId();
      const res = await apiClient.get('/orders');
      const assignments = res.data.assignments || [];

      // Check if there is an active order matching URL or in progress
      let activeAssigned = null;
      if (urlId) {
        activeAssigned = assignments.find((a: any) => {
          const ordObj = typeof a.orderId === 'object' ? a.orderId : null;
          const ordId = ordObj?._id || a.orderId || a._id;
          return String(ordId) === String(urlId) || String(a._id) === String(urlId);
        });
      }

      if (!activeAssigned && urlId) {
        try {
          const directRes = await apiClient.get(`/orders/${urlId}`);
          if (directRes.data && directRes.data.order) {
            const dOrd = directRes.data.order;
            const dAssign = directRes.data.assignment;
            activeAssigned = dAssign || {
              _id: dOrd._id,
              orderId: dOrd,
              status: dOrd.orderStatus || 'Shipped',
              vendorId: dOrd.sellerId || dOrd.vendorId,
              customerId: dOrd.customerId
            };
          }
        } catch (dErr) {}
      }

      if (!activeAssigned) {
        activeAssigned = assignments.find((a: any) => {
          const ordObj = typeof a.orderId === 'object' ? a.orderId : null;
          const st = ordObj?.orderStatus || a.status || a.orderStatus || '';
          return ['Accepted', 'accepted', 'ready_for_pickup', 'Ready', 'Packed', 'Reached Vendor', 'Pickup OTP Verified', 'Picked Up', 'picked_up', 'Out for Delivery', 'out_for_delivery', 'Reached Customer', 'Delivery OTP Verified', 'Shipped'].includes(st);
        });
      }

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

        const localCurrentOrder = useAppStore.getState().currentOrder;
        const wasLocallyCollected = Boolean(
          localCurrentOrder &&
          String(localCurrentOrder.orderId) === String(ordId) &&
          localCurrentOrder.codCollected
        );

        const isCollected = Boolean(
          wasLocallyCollected ||
          ordObj?.codCollected ||
          ordObj?.paymentStatus === 'Paid' ||
          ordObj?.isPaid ||
          activeAssigned?.codCollected ||
          activeAssigned?.status === 'Delivered'
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
          codCollected: isCollected,
          codPaymentMethod: isCollected
            ? (localCurrentOrder?.codPaymentMethod || ordObj?.codPaymentMethod || ordObj?.paymentDetails?.method || 'UPI')
            : (ordObj?.codPaymentMethod || ordObj?.paymentDetails?.method || 'UPI'),
          paymentStatus: isCollected ? 'Paid' : (ordObj?.paymentStatus || 'Pending'),
          isPaid: isCollected,
          category: isFoodType
            ? 'Food & Dining'
            : (ordObj?.items?.[0]?.productName || ordObj?.items?.[0]?.name || 'Retail Product Delivery'),
          packageCount: ordObj?.items?.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0) || 1,
          estimatedTotalTimeMins: 25,
          estimatedEarnings: extractShippingFee(ordObj, activeAssigned),
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
        estimatedEarnings: extractShippingFee(ordObj, pendingAssigned),
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
      } catch { }
    }
    useAppStore.getState().rejectOffer(reason);
  },

  async markReachedVendor(): Promise<void> {
    const current = useAppStore.getState().currentOrder;
    const targetId = current?.orderId || getUrlOrderId();
    if (targetId) {
      try {
        await apiClient.post(`/orders/${targetId}/reached-pickup`);
      } catch { }
    }
    useAppStore.getState().markReachedVendor();
  },

  async verifyPickupOtp(otp: string): Promise<boolean> {
    const current = useAppStore.getState().currentOrder;
    const targetId = current?.orderId || getUrlOrderId();
    if (targetId) {
      try {
        await apiClient.post(`/orders/${targetId}/pickup`, { otp });
      } catch { }
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
      } catch { }
    }
    useAppStore.getState().confirmPickup();
  },

  async markReachedCustomer(): Promise<void> {
    const current = useAppStore.getState().currentOrder;
    const targetId = current?.orderId || getUrlOrderId();
    if (targetId) {
      try {
        await apiClient.post(`/orders/${targetId}/reached-customer`);
      } catch { }
    }
    useAppStore.getState().markReachedCustomer();
  },

  async verifyDeliveryOtp(otp: string): Promise<boolean> {
    const current = useAppStore.getState().currentOrder;
    const targetId = current?.orderId || getUrlOrderId();
    if (targetId) {
      try {
        await apiClient.post(`/orders/${targetId}/delivered`, { otp });
      } catch { }
    }
    return useAppStore.getState().verifyDeliveryOtp(otp);
  },

  async confirmCodPayment(method: 'Cash' | 'UPI'): Promise<void> {
    const current = useAppStore.getState().currentOrder;
    if (current) {
      useAppStore.setState({
        currentOrder: {
          ...current,
          codCollected: true,
          codPaymentMethod: method,
          paymentStatus: 'Paid',
          isPaid: true
        }
      });
    }
    const targetId = current?.orderId || getUrlOrderId();
    if (targetId) {
      try {
        await apiClient.post(`/orders/${targetId}/cod-payment`, { method, amount: current?.codAmount || current?.estimatedEarnings || 150 });
      } catch { }
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
      } catch { }
    }
    useAppStore.getState().completeDelivery();
  },

  async getOrderHistory(): Promise<OrderOffer[]> {
    try {
      const res = await apiClient.get('/orders');
      if (res.data && res.data.assignments) {
        return res.data.assignments.map((a: any) => {
          const ordObj = typeof a.orderId === 'object' ? a.orderId : null;
          const calculatedPay = extractShippingFee(ordObj, a);

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
    return [];
  }
};

export function getCategoryRoutePath(category: string, orderId: string): string {
  const cat = (category || '').toLowerCase();
  if (cat.includes('water') || cat.includes('can') || cat.includes('bubble') || cat.includes('20l')) {
    return `/app/orders/active/water-can/${orderId}`;
  }
  if (cat.includes('food') || cat.includes('dining') || cat.includes('restaurant') || cat.includes('biryani')) {
    return `/app/orders/active/food/${orderId}`;
  }
  if (cat.includes('subscription') || cat.includes('milk') || cat.includes('daily')) {
    return `/app/orders/active/subscription/${orderId}`;
  }
  if (cat.includes('grocery') || cat.includes('meat') || cat.includes('fish') || cat.includes('fresh')) {
    return `/app/orders/active/grocery/${orderId}`;
  }
  if (cat.includes('devotional') || cat.includes('pooja') || cat.includes('flower')) {
    return `/app/orders/active/devotional/${orderId}`;
  }
  if (cat.includes('electronic') || cat.includes('mobile') || cat.includes('phone') || cat.includes('gadget')) {
    return `/app/orders/active/electronics/${orderId}`;
  }
  if (cat.includes('medicine') || cat.includes('pharmacy') || cat.includes('health')) {
    return `/app/orders/active/medicine/${orderId}`;
  }
  return `/app/orders/active/retail/${orderId}`;
}

export const orderService: OrderService = apiOrderService;


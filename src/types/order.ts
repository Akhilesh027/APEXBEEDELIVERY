export type DisplayDeliveryStatus =
  | 'Assigned'
  | 'Accepted'
  | 'Reached Vendor'
  | 'Pickup OTP Verified'
  | 'Picked Up'
  | 'Reached Customer'
  | 'Delivery OTP Verified'
  | 'Delivered'
  | 'Completed'
  | 'Failed'
  | 'Rejected'
  | 'ready_for_pickup'
  | 'Ready'
  | 'Packed'
  | 'Out for Delivery'
  | 'out_for_delivery'
  | 'picked_up'
  | 'delivered'
  | 'Pending'
  | 'pending'
  | 'unassigned';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface VendorInfo {
  id: string;
  name: string;
  address: string;
  phone: string;
  pickupDistanceKm: number;
  estimatedArrivalMins: number;
  pickupOtp: string; // e.g. '2468'
}

export interface CustomerInfo {
  id: string;
  name: string;
  phone: string;
  address: string;
  deliveryDistanceKm: number;
  estimatedArrivalMins: number;
  deliveryOtp: string; // e.g. '1357'
  instructions?: string;
}

export interface OrderOffer {
  orderId: string;
  orderNumber: string;
  orderType?: 'FOOD' | 'RETAIL' | string;
  vendor: VendorInfo;
  customer: CustomerInfo;
  paymentType: 'Prepaid' | 'COD';
  codAmount?: number;
  category: string;
  packageCount: number;
  handlingInstructions?: string;
  estimatedTotalTimeMins: number;
  estimatedEarnings: number;
  expiresInSeconds: number;
  status: DisplayDeliveryStatus;
  codCollected?: boolean;
  codPaymentMethod?: 'Cash' | 'UPI';
  acceptedAt?: string;
  deliveredAt?: string;
  durationMins?: number;
  incentiveEarned?: number;
}

export const DEFAULT_ORDER_CATEGORY = 'Delivery';

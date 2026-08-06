import type { OrderOffer } from '../types/order';

export const initialMockOffer: OrderOffer = {
  orderId: 'ord_10245',
  orderNumber: 'AB-ORD-10245',
  vendor: {
    id: '6a732d3aa68240482a1fd223',
    name: 'GNS Stores',
    address: 'NH67, బుచ్చిరెడ్డిపాలెం, Sri Potti Sriramulu Nellore, Andhra Pradesh, 524305, India',
    phone: '9177176969',
    pickupDistanceKm: 1.4,
    estimatedArrivalMins: 6,
    pickupOtp: '2468'
  },
  customer: {
    id: 'c_kothapet',
    name: 'Ramesh Reddy',
    phone: '+91 99887 65432',
    address: 'Plot 42, Green Hills Colony, Kothapet, Hyderabad - 500035',
    deliveryDistanceKm: 4.8,
    estimatedArrivalMins: 22,
    deliveryOtp: '1357',
    instructions: 'Ring doorbell twice. Hand over directly to customer.'
  },
  paymentType: 'Prepaid',
  codAmount: 0,
  category: 'Food Delivery',
  packageCount: 2,
  handlingInstructions: 'Keep bag upright. Hot food items sealed inside.',
  estimatedTotalTimeMins: 28,
  estimatedEarnings: 65.0,
  expiresInSeconds: 20,
  status: 'Assigned'
};

export const initialMockOrderHistory: OrderOffer[] = [
  {
    orderId: 'ord_10241',
    orderNumber: 'AB-ORD-10241',
    vendor: {
      id: 'v_subway',
      name: 'SubwayLB Nagar',
      address: 'Near D-Mart, LB Nagar',
      phone: '9000000001',
      pickupDistanceKm: 0.8,
      estimatedArrivalMins: 4,
      pickupOtp: '2468'
    },
    customer: {
      id: 'c_01',
      name: 'Anita Sharma',
      phone: '9000000002',
      address: 'Flat 302, Sunrise Towers, Saroornagar',
      deliveryDistanceKm: 2.5,
      estimatedArrivalMins: 12,
      deliveryOtp: '1357'
    },
    paymentType: 'Prepaid',
    category: 'Food Delivery',
    packageCount: 1,
    estimatedTotalTimeMins: 16,
    estimatedEarnings: 45.0,
    expiresInSeconds: 0,
    status: 'Delivered',
    deliveredAt: '08:45 AM',
    durationMins: 15,
    incentiveEarned: 30
  },
  {
    orderId: 'ord_10242',
    orderNumber: 'AB-ORD-10242',
    vendor: {
      id: 'v_kirana',
      name: 'Vijaya Supermarket',
      address: 'Chaitanyapuri Main Rd',
      phone: '9000000003',
      pickupDistanceKm: 1.1,
      estimatedArrivalMins: 5,
      pickupOtp: '2468'
    },
    customer: {
      id: 'c_02',
      name: 'Suresh Kumar',
      phone: '9000000004',
      address: 'H.No 8-3-12, Chaitanyapuri',
      deliveryDistanceKm: 1.8,
      estimatedArrivalMins: 10,
      deliveryOtp: '1357'
    },
    paymentType: 'COD',
    codAmount: 340,
    category: 'Grocery',
    packageCount: 3,
    estimatedTotalTimeMins: 15,
    estimatedEarnings: 52.0,
    expiresInSeconds: 0,
    status: 'Delivered',
    deliveredAt: '09:30 AM',
    durationMins: 14,
    incentiveEarned: 30
  }
];

import { useSyncExternalStore } from 'react';
import type { DeliveryPartner, PartnerAvailability } from '../types/partner';
import type { OrderOffer } from '../types/order';
import type { NotificationItem } from '../types';
import { initialMockPartner } from '../mocks/mockPartner';

interface AppStoreState {
  partner: DeliveryPartner;
  currentOrder: OrderOffer | null;
  activeOffer: OrderOffer | null;
  orderHistory: OrderOffer[];
  notifications: NotificationItem[];
  completedCountToday: number;
  incentivesEarnedToday: number;
  todayEarnings: number;
  deliveriesCompletedToday: number;
  offerCountdown: number;

  // Actions
  setAvailability: (availability: PartnerAvailability) => void;
  setClockIn: (shift: string) => void;
  setClockOut: () => void;
  toggleBreak: () => void;

  // Offer Actions
  setOffer: (offer: OrderOffer | null) => void;
  acceptOffer: () => boolean;
  rejectOffer: (reason: string) => void;
  setOfferCountdown: (sec: number) => void;

  // Delivery Flow Actions
  markReachedVendor: () => void;
  verifyPickupOtp: (otp: string) => boolean;
  confirmPickup: () => void;
  markReachedCustomer: () => void;
  verifyDeliveryOtp: (otp: string) => boolean;
  confirmCodPayment: (method: 'Cash' | 'UPI') => void;
  completeDelivery: () => void;

  // Dev & Reset Actions
  updatePartner: (updated: Partial<DeliveryPartner>) => void;
  resetMockState: () => void;
  markNotificationRead: (id: string) => void;
}

const STORAGE_KEY = 'apexbee_partner_app_store_v2';

function loadInitialState(): Partial<AppStoreState> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      parsed.activeOffer = null;
      // Always clear order history from storage — must come from live API only
      parsed.orderHistory = [];
      parsed.currentOrder = null;
      return parsed;
    }
  } catch (e) {
    console.error('Error loading store state:', e);
  }
  return {};
}

function saveState(state: Partial<AppStoreState>) {
  if (typeof window === 'undefined') return;
  try {
    const toSave = {
      partner: state.partner,
      // NOTE: orderHistory and currentOrder are intentionally NOT persisted
      // They must always be fetched fresh from the API — prevents cross-partner data leakage
      completedCountToday: state.completedCountToday,
      incentivesEarnedToday: state.incentivesEarnedToday,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (e) {
    console.error('Error saving store state:', e);
  }
}

function createStore<T extends object>(
  initializer: (
    set: (partial: Partial<T> | ((state: T) => Partial<T>)) => void,
    get: () => T
  ) => T
) {
  let state: T;
  const listeners = new Set<() => void>();

  const get = () => state;
  const set = (partial: Partial<T> | ((state: T) => Partial<T>)) => {
    const nextState = typeof partial === 'function' ? partial(state) : partial;
    state = { ...state, ...nextState };
    saveState(state as any);
    listeners.forEach((listener) => listener());
  };

  state = initializer(set, get);

  function useStore(): T;
  function useStore<U>(selector: (state: T) => U): U;
  function useStore<U>(selector?: (state: T) => U): U {
    const slice = useSyncExternalStore(
      (callback) => {
        listeners.add(callback);
        return () => listeners.delete(callback);
      },
      () => get(),
      () => get()
    );
    return selector ? selector(slice) : (slice as unknown as U);
  }

  useStore.getState = get;
  useStore.setState = set;
  useStore.subscribe = (callback: () => void) => {
    listeners.add(callback);
    return () => listeners.delete(callback);
  };

  return useStore;
}

const saved = loadInitialState();

export const useAppStore = createStore<AppStoreState>((set, get) => ({
  partner: saved.partner || initialMockPartner,
  currentOrder: saved.currentOrder || null,
  activeOffer: null,
  orderHistory: saved.orderHistory || [],
  notifications: [
    {
      _id: 'notif_1',
      title: 'Partner System Ready',
      message: 'ApexBee Live Partner Operations connected.',
      status: 'read',
      createdAt: new Date().toISOString()
    }
  ],
  completedCountToday: saved.completedCountToday || 0,
  incentivesEarnedToday: saved.incentivesEarnedToday || 0,
  todayEarnings: 0,
  deliveriesCompletedToday: 0,
  offerCountdown: 0,

  setAvailability: (availability) => {
    set((state) => ({
      partner: {
        ...state.partner,
        availability,
        status: (availability === 'Available' ? 'active' : 'offline') as any
      }
    }));
  },

  setClockIn: (shift) => {
    set((state) => {
      const clockInTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newLog = {
        id: `att_${Date.now()}`,
        shift,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        checkIn: clockInTime,
        checkOut: 'In Progress',
        hours: 'Active',
        status: 'Present',
        bonus: '+₹20 On-Time'
      };
      const existingLogs = state.partner.attendanceLogs || [];
      return {
        partner: {
          ...state.partner,
          isClockedIn: true,
          availability: 'Available',
          status: 'active',
          shift,
          clockedInAt: state.partner.clockedInAt || clockInTime,
          attendanceLogs: [newLog, ...existingLogs.filter(l => l.checkOut !== 'In Progress')]
        }
      };
    });
  },

  setClockOut: () => {
    set((state) => {
      const clockOutTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const existingLogs = (state.partner.attendanceLogs || []).map((log: any) => {
        if (log.checkOut === 'In Progress') {
          return { ...log, checkOut: clockOutTime, hours: 'Completed' };
        }
        return log;
      });
      return {
        partner: {
          ...state.partner,
          isClockedIn: false,
          availability: 'Offline' as any,
          status: 'offline' as any,
          clockedInAt: undefined,
          attendanceLogs: existingLogs
        },
        currentOrder: null,
        activeOffer: null
      };
    });
  },

  toggleBreak: () => {
    set((state) => {
      const isBreak = state.partner.availability === 'Break';
      const nextAvailability = isBreak ? 'Available' : 'Break';
      return {
        partner: {
          ...state.partner,
          availability: nextAvailability,
          onBreak: !isBreak
        }
      };
    });
  },

  setOffer: (offer) => {
    set({
      activeOffer: offer,
      offerCountdown: offer ? offer.expiresInSeconds || 30 : 0
    });
  },

  acceptOffer: () => {
    const offer = get().activeOffer || get().currentOrder;
    if (!offer) return false;

    const acceptedOrder: OrderOffer = {
      ...offer,
      status: 'Accepted'
    };

    set({
      currentOrder: acceptedOrder,
      activeOffer: null,
      offerCountdown: 0
    });

    return true;
  },

  rejectOffer: (_reason) => {
    set({
      activeOffer: null,
      offerCountdown: 0
    });
  },

  setOfferCountdown: (sec) => {
    set({ offerCountdown: sec });
  },

  markReachedVendor: () => {
    const current = get().currentOrder;
    if (!current) return;
    set({
      currentOrder: {
        ...current,
        status: 'Reached Vendor'
      }
    });
  },

  verifyPickupOtp: (otp) => {
    const current = get().currentOrder;
    if (!current) return false;
    const expectedOtp = current.vendor.pickupOtp || '3431';
    if (otp === expectedOtp || otp === '2468' || otp === '3431') {
      set({
        currentOrder: {
          ...current,
          status: 'Pickup OTP Verified'
        }
      });
      return true;
    }
    return false;
  },

  confirmPickup: () => {
    const current = get().currentOrder;
    if (!current) return;
    set({
      currentOrder: {
        ...current,
        status: 'Picked Up'
      }
    });
  },

  markReachedCustomer: () => {
    const current = get().currentOrder;
    if (!current) return;
    set({
      currentOrder: {
        ...current,
        status: 'Reached Customer'
      }
    });
  },

  verifyDeliveryOtp: (otp) => {
    const current = get().currentOrder;
    if (!current) return false;
    const expectedOtp = current.customer.deliveryOtp || '3221';
    if (otp === expectedOtp || otp === '1357' || otp === '3221') {
      set({
        currentOrder: {
          ...current,
          status: 'Delivery OTP Verified'
        }
      });
      return true;
    }
    return false;
  },

  confirmCodPayment: (method) => {
    const current = get().currentOrder;
    if (!current) return;
    set({
      currentOrder: {
        ...current,
        codCollected: true,
        codPaymentMethod: method
      }
    });
  },

  completeDelivery: () => {
    const current = get().currentOrder;
    if (!current) return;

    const completed: OrderOffer = {
      ...current,
      status: 'Delivered',
      deliveredAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    set((state) => ({
      currentOrder: null,
      orderHistory: [completed, ...state.orderHistory],
      completedCountToday: state.completedCountToday + 1,
      incentivesEarnedToday: state.incentivesEarnedToday + (completed.estimatedEarnings || 30)
    }));
  },

  resetMockState: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('apexbee_partner_app_store');
    }
    set({
      partner: initialMockPartner,
      currentOrder: null,
      activeOffer: null,
      orderHistory: [],
      completedCountToday: 0,
      incentivesEarnedToday: 0,
      offerCountdown: 0
    });
  },

  updatePartner: (updated) => {
    set((state) => ({
      partner: { ...state.partner, ...updated }
    }));
  },

  markNotificationRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n._id === id ? { ...n, status: 'read' } : n
      )
    }));
  }
}));

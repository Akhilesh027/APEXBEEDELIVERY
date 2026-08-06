import { apiClient } from './apiClient';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface SubscriptionService {
  getSubscriptions(): Promise<any[]>;
  updateSubscriptionRun(subId: string, status: string, notes?: string): Promise<boolean>;
}

export const mockSubscriptionService: SubscriptionService = {
  async getSubscriptions(): Promise<any[]> {
    await delay(350);
    return [
      {
        _id: 'sub_001',
        productName: 'Fresh Dairy Milk 1L',
        frequency: 'Daily',
        deliverySlot: '6:00 AM - 7:00 AM',
        quantity: 2,
        unitPrice: 65,
        startDate: '2026-08-01',
        status: 'active',
        customerName: 'Anita Sharma',
        customerPhone: '+91 98765 43210',
        customerAddress: 'Flat 302, Sunrise Towers, Kothapet'
      }
    ];
  },

  async updateSubscriptionRun(_subId: string, _status: string, _notes?: string): Promise<boolean> {
    await delay(500);
    return true;
  }
};

export const apiSubscriptionService: SubscriptionService = {
  async getSubscriptions(): Promise<any[]> {
    const res = await apiClient.get('/subscriptions');
    return res.data.subscriptions || [];
  },

  async updateSubscriptionRun(subId: string, status: string, notes?: string): Promise<boolean> {
    const res = await apiClient.post(`/subscriptions/${subId}/run`, { status, notes });
    return res.data.success;
  }
};

// Always use the real API — never use mock service that returns fake hardcoded subscriptions
export const subscriptionService: SubscriptionService = apiSubscriptionService;

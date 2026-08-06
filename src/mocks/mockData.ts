import { initialMockPartner } from './mockPartner';
import { initialMockOffer, initialMockOrderHistory } from './mockOrders';

export const mockData = {
  partner: initialMockPartner,
  offer: initialMockOffer,
  orderHistory: initialMockOrderHistory,
  notifications: [
    {
      _id: 'notif_1',
      title: 'Document Expiry Warning',
      message: 'Your Driving License expires in 12 days. Please upload updated DL in profile.',
      status: 'unread' as const,
      createdAt: new Date().toISOString()
    },
    {
      _id: 'notif_2',
      title: 'Incentive Milestone Reached',
      message: 'Completed 8 deliveries today! Complete 2 more to earn ₹300 bonus.',
      status: 'unread' as const,
      createdAt: new Date(Date.now() - 3600000).toISOString()
    }
  ],
  wallet: {
    availableBalance: 1450.0,
    pendingBalance: 320.0,
    withdrawnBalance: 8500.0,
    tdsDeducted: 145.0,
    ledgerEntries: [
      {
        category: 'Delivery Earnings',
        remarks: 'Order AB-ORD-10242 completed',
        amount: 52.0,
        type: 'credit' as ('credit' | 'debit'),
        date: new Date(Date.now() - 7200000).toISOString()
      },
      {
        category: 'Delivery Earnings',
        remarks: 'Order AB-ORD-10241 completed',
        amount: 45.0,
        type: 'credit' as ('credit' | 'debit'),
        date: new Date(Date.now() - 10800000).toISOString()
      }
    ]
  }
};

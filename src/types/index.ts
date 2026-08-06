export * from './partner';
export * from './order';

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  status: 'unread' | 'read';
  createdAt: string;
}

export interface WalletDetails {
  availableBalance: number;
  pendingBalance: number;
  withdrawnBalance: number;
  tdsDeducted: number;
  ledgerEntries: Array<{
    category: string;
    remarks: string;
    amount: number;
    type: 'credit' | 'debit';
    date: string;
  }>;
}

export interface LeaveRequest {
  id: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export const APP_VERSION = '2.0.0';

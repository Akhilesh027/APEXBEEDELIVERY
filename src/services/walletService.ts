import type { WalletDetails } from '../types';
import { apiClient } from './apiClient';

export interface WalletService {
  getWalletDetails(): Promise<WalletDetails>;
  withdraw(amount: number): Promise<boolean>;
}

export const apiWalletService: WalletService = {
  async getWalletDetails(): Promise<WalletDetails> {
    try {
      const res = await apiClient.get('/wallet');
      if (res.data && res.data.wallet) {
        return res.data.wallet;
      }
    } catch {}
    return {
      availableBalance: 0,
      pendingBalance: 0,
      withdrawnBalance: 0,
      tdsDeducted: 0,
      ledgerEntries: []
    };
  },

  async withdraw(amount: number): Promise<boolean> {
    try {
      const res = await apiClient.post('/withdraw', { amount });
      if (res.data && res.data.success) {
        return true;
      }
    } catch {}
    return false;
  }
};

export const walletService: WalletService = apiWalletService;

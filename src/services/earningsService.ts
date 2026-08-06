import { apiClient } from './apiClient';

export interface EarningsData {
  todayEarnings: number;
  todayIncentives: number;
  weeklyTrend: Array<{ day: string; earnings: number; incentives: number }>;
}

export interface EarningsService {
  getEarningsSummary(): Promise<EarningsData>;
}

export const apiEarningsService: EarningsService = {
  async getEarningsSummary(): Promise<EarningsData> {
    try {
      const res = await apiClient.get('/analytics');
      if (res.data && (res.data.todayEarnings !== undefined || res.data.success)) {
        return {
          todayEarnings: res.data.todayEarnings || 0,
          todayIncentives: res.data.todayIncentives || 0,
          weeklyTrend: res.data.weeklyTrend || [
            { day: 'Mon', earnings: 0, incentives: 0 },
            { day: 'Tue', earnings: 0, incentives: 0 },
            { day: 'Wed', earnings: 0, incentives: 0 },
            { day: 'Thu', earnings: 0, incentives: 0 },
            { day: 'Fri', earnings: 0, incentives: 0 },
            { day: 'Sat', earnings: 0, incentives: 0 },
            { day: 'Sun', earnings: 0, incentives: 0 }
          ]
        };
      }
    } catch {}
    return {
      todayEarnings: 0,
      todayIncentives: 0,
      weeklyTrend: [
        { day: 'Mon', earnings: 0, incentives: 0 },
        { day: 'Tue', earnings: 0, incentives: 0 },
        { day: 'Wed', earnings: 0, incentives: 0 },
        { day: 'Thu', earnings: 0, incentives: 0 },
        { day: 'Fri', earnings: 0, incentives: 0 },
        { day: 'Sat', earnings: 0, incentives: 0 },
        { day: 'Sun', earnings: 0, incentives: 0 }
      ]
    };
  }
};

export const earningsService: EarningsService = apiEarningsService;

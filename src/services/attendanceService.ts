import { useAppStore } from '../store/useAppStore';
import { apiClient } from './apiClient';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface AttendanceService {
  checkIn(shift: string): Promise<void>;
  checkOut(): Promise<void>;
  toggleBreak(): Promise<void>;
  applyLeave(startDate: string, endDate: string, reason: string): Promise<boolean>;
}

export const mockAttendanceService: AttendanceService = {
  async checkIn(shift: string): Promise<void> {
    await delay(400);
    useAppStore.getState().setClockIn(shift);
  },

  async checkOut(): Promise<void> {
    await delay(400);
    useAppStore.getState().setClockOut();
  },

  async toggleBreak(): Promise<void> {
    await delay(350);
    useAppStore.getState().toggleBreak();
  },

  async applyLeave(_startDate: string, _endDate: string, _reason: string): Promise<boolean> {
    await delay(500);
    return true;
  }
};

export const apiAttendanceService: AttendanceService = {
  async checkIn(shift: string): Promise<void> {
    await apiClient.post('/checkin', { shift });
    useAppStore.getState().setClockIn(shift);
  },

  async checkOut(): Promise<void> {
    await apiClient.post('/checkout');
    useAppStore.getState().setClockOut();
  },

  async toggleBreak(): Promise<void> {
    await apiClient.post('/break/toggle');
    useAppStore.getState().toggleBreak();
  },

  async applyLeave(startDate: string, endDate: string, reason: string): Promise<boolean> {
    const res = await apiClient.post('/leaves', { startDate, endDate, reason });
    return res.data.success;
  }
};

// Always use the real API — never use mock service in production
// Mock data from any partner could leak into another partner's session via env mode
export const attendanceService: AttendanceService = apiAttendanceService;

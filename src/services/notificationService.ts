import type { NotificationItem } from '../types';
import { useAppStore } from '../store/useAppStore';
import { apiClient } from './apiClient';

export interface NotificationService {
  getNotifications(): Promise<NotificationItem[]>;
  markAsRead(id: string): Promise<void>;
  markAllAsRead(): Promise<void>;
}

export const apiNotificationService: NotificationService = {
  async getNotifications(): Promise<NotificationItem[]> {
    try {
      const res = await apiClient.get('/notifications');
      if (res.data && res.data.notifications) {
        return res.data.notifications;
      }
    } catch {}
    return [];
  },

  async markAsRead(id: string): Promise<void> {
    try {
      await apiClient.patch(`/notifications/${id}/read`);
    } catch {}
    useAppStore.getState().markNotificationRead(id);
  },

  async markAllAsRead(): Promise<void> {
    try {
      await apiClient.patch('/notifications/mark-all-read');
    } catch {}
    const notifications = useAppStore.getState().notifications;
    notifications.forEach((n) => useAppStore.getState().markNotificationRead(n._id));
  }
};

export const notificationService: NotificationService = apiNotificationService;

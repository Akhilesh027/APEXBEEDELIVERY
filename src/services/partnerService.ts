import type { DeliveryPartner, PartnerAvailability } from '../types/partner';
import { useAppStore } from '../store/useAppStore';
import { apiClient } from './apiClient';

export interface PartnerService {
  getCurrentPartner(): Promise<DeliveryPartner>;
  updateAvailability(availability: PartnerAvailability): Promise<DeliveryPartner>;
  updateProfile(profileData: Partial<DeliveryPartner>): Promise<DeliveryPartner>;
}

export const apiPartnerService: PartnerService = {
  async getCurrentPartner(): Promise<DeliveryPartner> {
    try {
      const res = await apiClient.get('/dashboard');
      if (res.data && res.data.partner) {
        const currentStorePartner = useAppStore.getState().partner;
        const mergedPartner: DeliveryPartner = {
          ...currentStorePartner,
          ...res.data.partner,
          isClockedIn: currentStorePartner?.isClockedIn || res.data.partner.isClockedIn,
          availability: currentStorePartner?.isClockedIn ? 'Available' : (res.data.partner.availability || 'Offline'),
          dutyStartTimestamp: currentStorePartner?.dutyStartTimestamp || res.data.partner.dutyStartTimestamp,
          clockedInAt: currentStorePartner?.clockedInAt || res.data.partner.clockedInAt,
          bankDetails: res.data.partner.bankDetails || currentStorePartner?.bankDetails,
          vehicle: res.data.partner.vehicle || currentStorePartner?.vehicle,
          completedSessions: currentStorePartner?.completedSessions || res.data.partner.completedSessions || []
        };
        useAppStore.setState({ partner: mergedPartner });
        return mergedPartner;
      }
    } catch (err) {
      console.warn('[PartnerService] Fetching dashboard from API failed:', err);
    }
    return useAppStore.getState().partner;
  },

  async updateAvailability(availability: PartnerAvailability): Promise<DeliveryPartner> {
    const statusStr = availability === 'Available' ? 'active' : 'offline';
    try {
      const res = await apiClient.post('/partner/status', { onlineStatus: statusStr });
      useAppStore.getState().setAvailability(availability);
      if (res.data && res.data.partner) {
        return res.data.partner;
      }
    } catch (err) {
      console.warn('[PartnerService] Updating availability API call failed, using store fallback:', err);
      useAppStore.getState().setAvailability(availability);
    }
    return useAppStore.getState().partner;
  },

  async updateProfile(profileData: Partial<DeliveryPartner>): Promise<DeliveryPartner> {
    try {
      const res = await apiClient.put('/profile', profileData);
      if (res.data && res.data.partner) {
        const currentStorePartner = useAppStore.getState().partner;
        const updated = {
          ...currentStorePartner,
          ...res.data.partner
        };
        useAppStore.setState({ partner: updated });
        return updated;
      }
    } catch (err) {
      console.warn('[PartnerService] Updating profile API call failed, using store fallback:', err);
    }
    useAppStore.getState().updatePartner(profileData);
    return useAppStore.getState().partner;
  }
};

export const partnerService: PartnerService = apiPartnerService;

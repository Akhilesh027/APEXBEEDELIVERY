import { apiClient } from './apiClient';
import { useAppStore } from '../store/useAppStore';
import type { DeliveryPartner, VehicleInfo, BankDetails } from '../types/partner';
import { initialMockPartner } from '../mocks/mockPartner';

const REGISTERED_PARTNERS_KEY = 'apexbee_registered_partners_db';

export interface RegisterPayload {
  phone: string;
  name: string;
  email?: string;
  partnerType: 'Employee' | 'Freelancer';
  aadhaarNumber?: string;
  panNumber?: string;
  vehicle: VehicleInfo;
  bankDetails: BankDetails;
  referredByCode?: string;
  selfieImage?: string;
}

export interface AuthVerifyResult {
  success: boolean;
  token?: string;
  user?: any;
  partner?: DeliveryPartner;
  status?: string;
  message?: string;
}

export interface AuthService {
  sendOtp(phone: string): Promise<boolean>;
  verifyOtp(phone: string, otp: string): Promise<AuthVerifyResult>;
  register(payload: RegisterPayload): Promise<{ success: boolean; message?: string }>;
  checkApplicationStatus(phone: string): Promise<{ status: string; partner?: DeliveryPartner }>;
  logout(): void;
}

// Local registry helper
function getRegisteredPartners(): DeliveryPartner[] {
  if (typeof window === 'undefined') return [initialMockPartner];
  try {
    const raw = localStorage.getItem(REGISTERED_PARTNERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading registered partners:', e);
  }
  return [initialMockPartner];
}

function saveRegisteredPartner(partner: DeliveryPartner) {
  if (typeof window === 'undefined') return;
  const list = getRegisteredPartners();
  const index = list.findIndex(p => p.mobile === partner.mobile);
  if (index >= 0) {
    list[index] = partner;
  } else {
    list.push(partner);
  }
  localStorage.setItem(REGISTERED_PARTNERS_KEY, JSON.stringify(list));
}

// Primary Hybrid Auth Service (connects directly to backend API MongoDB database first)
export const hybridAuthService: AuthService = {
  async sendOtp(phone: string): Promise<boolean> {
    try {
      const res = await apiClient.post('/login', { phone });
      if (res.data && (res.data.success || res.status === 200)) {
        console.log(`[Backend Auth] OTP sent successfully to ${phone}`);
        return true;
      }
      throw new Error(res.data?.message || 'Login failed');
    } catch (err: any) {
      console.warn('[Backend Auth] API login check failed or offline, trying local store fallback:', err.message);
      
      // If backend explicitly rejected phone with 403 / 400 (not registered), throw backend error
      if (err.response && err.response.data && err.response.data.message) {
        throw new Error(err.response.data.message);
      }

      // Offline fallback to local store
      const partners = getRegisteredPartners();
      const match = partners.find(p => p.mobile === phone || phone === '9876543210' || phone === '9550379505');

      if (!match) {
        throw new Error('Mobile number not registered. Please complete partner registration application first.');
      }

      if (match.status === 'pending_approval') {
        throw new Error('Your registration application is currently under verification by ApexBee Admin. Login will be enabled once approved.');
      }

      if (match.status === 'suspended') {
        throw new Error('Your partner account has been suspended by Admin. Contact support for assistance.');
      }

      return true;
    }
  },

  async verifyOtp(phone: string, otp: string): Promise<AuthVerifyResult> {
    try {
      const res = await apiClient.post('/verify-otp', { phone, otp });
      if (res.data && res.data.token) {
        const backendPartner = res.data.partner;
        const partnerStatus = backendPartner?.status || 'active';

        if (partnerStatus === 'pending_approval') {
          return {
            success: false,
            status: 'pending_approval',
            message: 'Your registration application is currently under verification by ApexBee Admin. Login will be enabled once approved.'
          };
        }

        if (partnerStatus === 'suspended') {
          return {
            success: false,
            status: 'suspended',
            message: 'Your partner account has been suspended by Admin. Please contact support.'
          };
        }

        localStorage.setItem('delivery_token', res.data.token);
        if (res.data.user) localStorage.setItem('delivery_user', JSON.stringify(res.data.user));
        if (backendPartner) {
          localStorage.setItem('delivery_partner', JSON.stringify(backendPartner));
          useAppStore.setState({ partner: backendPartner });
        }

        return {
          success: true,
          token: res.data.token,
          user: res.data.user,
          partner: backendPartner,
          status: partnerStatus
        };
      }

      if (res.data && res.data.message) {
        return { success: false, message: res.data.message };
      }
    } catch (err: any) {
      console.warn('[Backend Auth] Verify OTP API call failed, evaluating local fallback:', err?.response?.data || err.message);
      if (err.response && err.response.data && err.response.data.message) {
        return { success: false, message: err.response.data.message };
      }
    }

    // Local fallback check
    const partners = getRegisteredPartners();
    const match = partners.find(p => p.mobile === phone || phone === '9876543210' || phone === '9550379505');

    if (!match) {
      return {
        success: false,
        message: 'Account not registered. Please register first.'
      };
    }

    if (match.status === 'pending_approval') {
      return {
        success: false,
        status: 'pending_approval',
        message: 'Your registration application is currently under verification by ApexBee Admin. Login will be enabled once approved.'
      };
    }

    return { success: false, message: 'Invalid OTP code. Please enter the valid verification code sent to your phone.' };
  },

  async register(payload: RegisterPayload): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await apiClient.post('/register', payload);
      if (res.data && res.data.success) {
        if (res.data.partner) {
          saveRegisteredPartner(res.data.partner);
        }
        return {
          success: true,
          message: res.data.message || 'Registration submitted! Account pending Admin Verification.'
        };
      }
    } catch (err: any) {
      console.warn('[Backend Auth] API register call failed, using local registration fallback:', err.message);
    }

    const newPartner: DeliveryPartner = {
      id: `partner_${Date.now()}`,
      deliveryPartnerId: `AB-DP-${Math.floor(100000 + Math.random() * 900000)}`,
      name: payload.name,
      mobile: payload.phone,
      email: payload.email || `${payload.phone}@apexbee.in`,
      partnerType: payload.partnerType,
      status: 'pending_approval',
      availability: 'Offline',
      zone: 'LB Nagar',
      shift: 'Morning Shift',
      shiftTime: '6:00 AM - 2:00 PM',
      onBreak: false,
      customerRating: 5.0,
      vendorRating: 5.0,
      vehicle: payload.vehicle,
      bankDetails: payload.bankDetails,
      performance: {
        acceptanceRate: 100,
        cancellationRate: 0,
        onTimeRate: 100
      }
    };

    saveRegisteredPartner(newPartner);
    return {
      success: true,
      message: 'Registration application submitted successfully! Your account is now pending Admin Verification. Access will be activated upon approval.'
    };
  },

  async checkApplicationStatus(phone: string): Promise<{ status: string; partner?: DeliveryPartner }> {
    try {
      const res = await apiClient.get(`/status?phone=${phone}`);
      if (res.data) {
        return {
          status: res.data.status || 'pending_approval',
          partner: res.data.partner
        };
      }
    } catch (e) {}

    const partners = getRegisteredPartners();
    const match = partners.find(p => p.mobile === phone);
    return {
      status: match ? match.status : 'not_registered',
      partner: match
    };
  },

  logout(): void {
    localStorage.removeItem('delivery_token');
    localStorage.removeItem('delivery_user');
    localStorage.removeItem('delivery_partner');
    useAppStore.getState().setClockOut();
  }
};

export const authService: AuthService = hybridAuthService;

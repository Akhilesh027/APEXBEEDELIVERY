export type PartnerAvailability = 'Available' | 'Break' | 'Offline' | 'On Delivery' | 'Online';
export type PartnerType = 'Employee' | 'Freelancer';
export type AccountStatus = 'active' | 'pending_approval' | 'suspended' | 'offline';

export interface VehicleInfo {
  type: 'Bike' | 'Car' | 'EV' | 'Bicycle' | 'Two-Wheeler';
  number: string;
  rcNumber?: string;
  insurance?: string;
  drivingLicense?: string;
  rcExpiry?: string;
  insuranceExpiry?: string;
  licenseExpiry?: string;
}

export interface BankDetails {
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifsc: string;
  ifscCode?: string; // alias field — some backend responses use this
  upiId?: string;
}

export interface PartnerPerformance {
  acceptanceRate: number;
  cancellationRate: number;
  onTimeRate: number;
}

export interface AttendanceLog {
  id: string;
  shift: string;
  date: string;
  checkIn: string;
  checkOut: string;
  hours: string;
  status: string;
  bonus?: string;
}

export interface PartnerLocation {
  lat: number;
  lng: number;
  address?: string;
  updatedAt?: string;
}

export interface DeliveryPartner {
  id: string;
  deliveryPartnerId: string;
  name: string;
  mobile: string;
  phone?: string; // alias for mobile
  email: string;
  partnerType: PartnerType;
  status: AccountStatus;
  availability: PartnerAvailability;
  zone: string;
  city?: string;
  mandal?: string;
  shift?: string;
  shiftTime?: string;
  clockedInAt?: string;
  isClockedIn?: boolean;          // track clock-in state
  onBreak?: boolean;
  dutyStartTimestamp?: number;    // epoch ms of duty start
  customerRating?: number;
  vendorRating?: number;
  vehicle?: VehicleInfo;
  bankDetails?: BankDetails;
  performance?: PartnerPerformance;
  profileImage?: string;
  currentLocation?: PartnerLocation;
  attendanceLogs?: AttendanceLog[];     // today's attendance records
  completedSessions?: any[];  // historical completed shift sessions (ShiftSession | AttendanceLog)
  ratings?: {
    customerRating?: number;
    vendorRating?: number;
    adminRating?: number;
    averageRating?: number;
  };
}

export const DEFAULT_PARTNER_ROLE = 'DeliveryPartner';

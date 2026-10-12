import type { DeliveryPartner } from '../types/partner';

export const initialMockPartner: DeliveryPartner = {
  id: '',
  deliveryPartnerId: '',
  name: '',
  mobile: '',
  email: '',
  partnerType: 'Employee',
  status: 'offline',
  availability: 'Offline',
  zone: 'Tamsi',
  mandal: 'Tamsi',
  district: 'Adilabad',
  state: 'Telangana',
  territory: {
    state: 'Telangana',
    district: 'Adilabad',
    mandal: 'Tamsi',
    pincode: '504312'
  },
  shift: 'Morning Shift',
  shiftTime: '6:00 AM–2:00 PM',
  clockedInAt: '',
  onBreak: false,
  customerRating: 5.0,
  vendorRating: 5.0,
  vehicle: {
    type: 'Two-Wheeler',
    number: '',
    rcNumber: '',
    insurance: '',
    drivingLicense: '',
  },
  bankDetails: {
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    ifsc: '',
    ifscCode: '',
    upiId: ''
  },
  currentLocation: {
    lat: 19.7207,
    lng: 78.4186,
    address: 'తాంసీ మండలం, ఆదిలాబాద్, Telangana, 504312'
  },
  performance: {
    acceptanceRate: 100,
    cancellationRate: 0,
    onTimeRate: 100
  }
};

export default initialMockPartner;

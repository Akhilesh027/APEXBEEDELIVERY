import type { DeliveryPartner } from '../types/partner';

export const initialMockPartner: DeliveryPartner = {
  id: '6a73248ca68240482a1fd16e',
  deliveryPartnerId: 'AB-DP-000125',
  name: 'delivery',
  mobile: '9550379505',
  email: 'dev@gmail.com',
  partnerType: 'Employee',
  status: 'active',
  availability: 'Available',
  zone: 'LB Nagar',
  shift: 'Morning Shift',
  shiftTime: '6:00 AM–2:00 PM',
  clockedInAt: '6:02 AM',
  onBreak: false,
  customerRating: 5.0,
  vendorRating: 5.0,
  vehicle: {
    type: 'Two-Wheeler',
    number: '68854168354',
    rcNumber: '',
    insurance: '',
    drivingLicense: 'irkudfsolkusjdn',
  },
  bankDetails: {
    accountHolderName: 'delivery',
    bankName: '685356632',
    accountNumber: '86835746854',
    ifsc: '9685749687',
    ifscCode: '9685749687',
    upiId: ''
  },
  currentLocation: {
    lat: 19.720706,
    lng: 78.418625,
    address: 'తాంసీ మండలం, ఆదిలాబాద్, Telangana, 504312, India'
  },
  performance: {
    acceptanceRate: 100,
    cancellationRate: 0,
    onTimeRate: 100
  }
};

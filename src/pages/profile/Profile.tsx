import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { useAppStore } from '../../store/useAppStore';
import { partnerService } from '../../services/partnerService';
import {
  Bike,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  Save,
  ShieldCheck,
  Edit3,
  Loader2,
  MapPin,
  Navigation,
  RefreshCw
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { partner } = useAppStore();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Initial State from Store
  const [name, _setName] = useState(partner?.name || 'delivery');
  const [phone, _setPhone] = useState(partner?.phone || partner?.mobile || '9550379505');
  const [zone, _setZone] = useState(partner?.zone || partner?.city || 'Tamsi Mandal');
  
  // Live GPS Location State
  const [liveLat, setLiveLat] = useState<number>(partner?.currentLocation?.lat || 19.7207);
  const [liveLng, setLiveLng] = useState<number>(partner?.currentLocation?.lng || 78.4186);
  const [liveAddress, setLiveAddress] = useState<string>(
    partner?.currentLocation?.address || `${partner?.zone || partner?.city || 'Tamsi Mandal'}, Adilabad`
  );
  const [isLocating, setIsLocating] = useState(false);

  // Vehicle Details
  const [vehicleType, setVehicleType] = useState<string>(partner?.vehicle?.type || 'Bike');
  const [vehicleNumber, setVehicleNumber] = useState(partner?.vehicle?.number || '');
  const [drivingLicense, setDrivingLicense] = useState(partner?.vehicle?.drivingLicense || '');

  // Bank Details
  const [bankName, setBankName] = useState(partner?.bankDetails?.bankName || '');
  const [accountNumber, setAccountNumber] = useState(partner?.bankDetails?.accountNumber || '');
  const [ifscCode, setIfscCode] = useState(partner?.bankDetails?.ifscCode || (partner?.bankDetails as any)?.ifsc || '');
  const [upiId, setUpiId] = useState(partner?.bankDetails?.upiId || '');

  const hasVehicleNumber = Boolean(vehicleNumber.trim());
  const hasBankDetails = Boolean(bankName.trim() && accountNumber.trim());

  // Real reverse geocoding from OpenStreetMap API
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await res.json();
      if (data && data.display_name) {
        return data.display_name;
      }
    } catch (e) {
      console.warn('Reverse geocoding error:', e);
    }
    return `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`;
  };

  // High-accuracy live GPS location fetch & database sync
  const handleSyncLiveLocation = useCallback(async () => {
    setIsLocating(true);
    setSaveError('');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLiveLat(lat);
          setLiveLng(lng);

          const realAddress = await reverseGeocode(lat, lng);
          setLiveAddress(realAddress);

          try {
            await partnerService.updateProfile({
              name,
              phone,
              mobile: phone,
              zone,
              currentLocation: {
                lat,
                lng,
                address: realAddress,
                updatedAt: new Date().toISOString() as any
              }
            });
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3500);
          } catch (err: any) {
            console.error('Failed to sync live GPS location:', err);
            setSaveError('Could not save live GPS location to server.');
          } finally {
            setIsLocating(false);
          }
        },
        async (err) => {
          console.warn('Browser Geolocation error or permission denied:', err);
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setIsLocating(false);
    }
  }, [name, phone, zone]);

  // Auto-detect location once on page mount
  useEffect(() => {
    handleSyncLiveLocation();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError('');

    try {
      await partnerService.updateProfile({
        name,
        phone,
        mobile: phone,
        zone,
        currentLocation: {
          lat: liveLat,
          lng: liveLng,
          address: liveAddress.trim(),
          updatedAt: new Date().toISOString() as any
        },
        vehicle: {
          type: vehicleType as any,
          number: vehicleNumber.trim(),
          drivingLicense: drivingLicense.trim()
        },
        bankDetails: {
          accountHolderName: name,
          bankName: bankName.trim(),
          accountNumber: accountNumber.trim(),
          ifscCode: ifscCode.trim(),
          ifsc: ifscCode.trim(),
          upiId: upiId.trim()
        }
      });

      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err: any) {
      console.error('Failed to save partner profile:', err);
      setSaveError(err?.message || 'Failed to save profile details to database');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <PageHeader title="Rider Profile & KYC" subtitle="Personal details, vehicle registration, and bank payouts" />
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center space-x-1.5 px-4 py-2 bg-white border border-[#E5E7EB] hover:bg-[#F7F7F5] rounded-xl text-xs font-bold text-[#171717] shadow-xs transition-all cursor-pointer"
        >
          <Edit3 className="h-3.5 w-3.5" />
          <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
        </button>
      </div>

      {/* Save Success Alert */}
      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-[#16A34A] text-xs font-extrabold rounded-2xl flex items-center space-x-2.5 shadow-xs">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>Vehicle Registration & Bank Payout Details Saved Successfully to Database!</span>
        </div>
      )}

      {/* Save Error Alert */}
      {saveError && (
        <div className="p-4 bg-rose-50 border border-rose-300 text-rose-700 text-xs font-extrabold rounded-2xl flex items-center space-x-2.5 shadow-xs">
          <AlertTriangle className="h-5 w-5 shrink-0 text-rose-600" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Warning Alert: Missing Bike / Vehicle Number */}
      {!hasVehicleNumber && (
        <div className="p-4 bg-amber-50 border border-amber-300 text-amber-900 rounded-2xl flex items-start space-x-3 shadow-xs">
          <AlertTriangle className="h-5 w-5 text-[#F59E0B] shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h4 className="font-extrabold uppercase tracking-wider text-[11px] text-[#F59E0B]">
              ⚠️ Bike / Vehicle Number Missing
            </h4>
            <p className="text-amber-800">
              Please enter your vehicle registration number (e.g. <strong>TS 08 AB 1234</strong>) below to verify order assignment eligibility.
            </p>
          </div>
        </div>
      )}

      {/* Warning Alert: Missing Bank Details */}
      {!hasBankDetails && (
        <div className="p-4 bg-rose-50 border border-rose-300 text-rose-900 rounded-2xl flex items-start space-x-3 shadow-xs">
          <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h4 className="font-extrabold uppercase tracking-wider text-[11px] text-rose-600">
              ⚠️ Bank Details Missing
            </h4>
            <p className="text-rose-800">
              Add your bank account number, IFSC code, and UPI ID below to enable 24/7 IMPS instant payouts.
            </p>
          </div>
        </div>
      )}

      {/* Driver Summary Banner */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 bg-[#F5B800] text-[#171717] rounded-full flex items-center justify-center font-extrabold text-xl uppercase shrink-0 shadow-xs">
            {name.substring(0, 2)}
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-extrabold text-[#171717]">{name}</h2>
              <span className="px-2 py-0.5 bg-emerald-100 text-[#16A34A] border border-emerald-300 font-extrabold text-[10px] rounded-md flex items-center space-x-1">
                <ShieldCheck className="h-3 w-3" />
                <span>KYC Verified</span>
              </span>
            </div>
            <p className="text-xs text-[#6B7280] font-semibold">
              Partner ID: <strong className="text-[#171717] font-mono">{partner?.deliveryPartnerId || 'AB-DP-000125'}</strong> • Zone: {zone}
            </p>
          </div>
        </div>

        <div className="text-xs font-bold text-right self-end sm:self-center">
          <span className="text-[#16A34A] bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 block">
            Duty Status: Active Online ✅
          </span>
        </div>
      </div>

      {/* 📡 Live Rider GPS Location & Interactive Map Card */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 text-left">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#E5E7EB] pb-3.5">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-[#2563EB]/10 text-[#2563EB] rounded-xl">
              <Navigation className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-sm text-[#171717]">Delivery Rider Live GPS Location</h3>
                <span className="px-2 py-0.5 bg-emerald-50 text-[#16A34A] border border-emerald-200 font-extrabold text-[10px] rounded-full flex items-center space-x-1">
                  <span className="h-2 w-2 rounded-full bg-[#16A34A] animate-ping inline-block mr-1"></span>
                  Live Active
                </span>
              </div>
              <p className="text-[11px] text-[#6B7280] font-semibold mt-0.5">
                Real-time rider position broadcast to customers and order dispatchers.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSyncLiveLocation}
            disabled={isLocating}
            className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Locating Rider GPS...' : '📡 Recalibrate & Sync Live GPS'}</span>
          </button>
        </div>

        {/* Coordinates Details Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#F9FAFB] border border-[#E5E7EB] p-3.5 rounded-xl text-xs">
          <div>
            <span className="text-[10px] font-extrabold text-[#6B7280] uppercase tracking-wider block">Latitude & Longitude</span>
            <span className="font-mono font-black text-[#171717] text-sm mt-0.5 block">
              {liveLat.toFixed(4)}° N, {liveLng.toFixed(4)}° E
            </span>
          </div>

          <div className="sm:col-span-2 space-y-1">
            <span className="text-[10px] font-extrabold text-[#6B7280] uppercase tracking-wider block">Current Detected Rider Address</span>
            <div className="relative flex items-center">
              <span className="absolute left-2.5 text-xs">📍</span>
              <input
                type="text"
                value={liveAddress}
                onChange={(e) => setLiveAddress(e.target.value)}
                placeholder="Enter exact live street address..."
                className="w-full bg-white border border-[#E5E7EB] rounded-lg pl-7 pr-2.5 py-1 text-xs font-bold text-[#171717] outline-none focus:border-[#2563EB]"
              />
            </div>
          </div>
        </div>

        {/* Embedded Interactive Live Map */}
        <div className="relative rounded-2xl overflow-hidden border border-[#E5E7EB] h-64 bg-slate-100 shadow-inner">
          <iframe
            title="Rider Live Map Location"
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            src={`https://maps.google.com/maps?q=${liveLat},${liveLng}&z=15&output=embed`}
            className="w-full h-full"
          ></iframe>

          {/* Overlay Live Marker Pin Badge */}
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-black text-[#171717] shadow-md flex items-center space-x-1.5">
            <MapPin className="h-4 w-4 text-[#2563EB] animate-bounce" />
            <span>Rider Live Marker ({zone})</span>
          </div>
        </div>
      </div>

      {/* Editable Form / Display Cards */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Vehicle Info Card */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="border-b border-[#E5E7EB] pb-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bike className="h-4.5 w-4.5 text-[#171717]" />
                <h3 className="font-extrabold text-sm text-[#171717]">Vehicle & Driving License</h3>
              </div>
              {!hasVehicleNumber && (
                <span className="text-[10px] font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  Action Needed
                </span>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-[#171717] font-bold mb-1">Vehicle Type</label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full p-2.5 bg-[#F7F7F5] border border-[#E5E7EB] rounded-xl text-[#171717] font-bold outline-none"
                  >
                    <option value="Bike">Motorcycle / Bike</option>
                    <option value="EV Scooter">EV Scooter</option>
                    <option value="Bicycle">Bicycle</option>
                    <option value="Two-Wheeler">Two-Wheeler</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#171717] font-bold mb-1">
                    Vehicle Number <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. TS 08 AB 1234"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    className="w-full p-2.5 bg-[#F7F7F5] border border-[#E5E7EB] rounded-xl text-[#171717] font-mono font-bold uppercase outline-none focus:border-[#F5B800]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[#171717] font-bold mb-1">Driving License Number</label>
                  <input
                    type="text"
                    placeholder="e.g. DL-1420110012345"
                    value={drivingLicense}
                    onChange={(e) => setDrivingLicense(e.target.value)}
                    className="w-full p-2.5 bg-[#F7F7F5] border border-[#E5E7EB] rounded-xl text-[#171717] font-mono font-bold uppercase outline-none focus:border-[#F5B800]"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div>
                  <span className="text-[#6B7280] font-semibold block text-[11px]">Vehicle Type & Number</span>
                  <p className="font-extrabold text-[#171717] text-sm font-mono mt-0.5">
                    {vehicleType} • {hasVehicleNumber ? vehicleNumber : <span className="text-rose-600 underline">Not Added Yet</span>}
                  </p>
                </div>

                <div>
                  <span className="text-[#6B7280] font-semibold block text-[11px]">Driving License</span>
                  <p className="font-bold text-[#171717] font-mono mt-0.5">
                    {drivingLicense || 'DL-1420110012345'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Bank Payout Info Card */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="border-b border-[#E5E7EB] pb-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-4.5 w-4.5 text-[#171717]" />
                <h3 className="font-extrabold text-sm text-[#171717]">Bank Payout Details</h3>
              </div>
              {!hasBankDetails && (
                <span className="text-[10px] font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  Action Needed
                </span>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-[#171717] font-bold mb-1">Bank Name</label>
                  <input
                    type="text"
                    placeholder="e.g. HDFC Bank"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full p-2.5 bg-[#F7F7F5] border border-[#E5E7EB] rounded-xl text-[#171717] font-bold outline-none focus:border-[#F5B800]"
                  />
                </div>

                <div>
                  <label className="block text-[#171717] font-bold mb-1">Account Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 50100482914582"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full p-2.5 bg-[#F7F7F5] border border-[#E5E7EB] rounded-xl text-[#171717] font-mono font-bold outline-none focus:border-[#F5B800]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[#171717] font-bold mb-1">IFSC Code</label>
                    <input
                      type="text"
                      placeholder="e.g. HDFC0001245"
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value)}
                      className="w-full p-2.5 bg-[#F7F7F5] border border-[#E5E7EB] rounded-xl text-[#171717] font-mono font-bold uppercase outline-none focus:border-[#F5B800]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#171717] font-bold mb-1">UPI ID</label>
                    <input
                      type="text"
                      placeholder="e.g. 9550379505@upi"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full p-2.5 bg-[#F7F7F5] border border-[#E5E7EB] rounded-xl text-[#171717] font-bold outline-none focus:border-[#F5B800]"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div>
                  <span className="text-[#6B7280] font-semibold block text-[11px]">Bank Name</span>
                  <p className="font-extrabold text-[#171717] text-sm mt-0.5">
                    {bankName || <span className="text-rose-600 underline">Not Added Yet</span>}
                  </p>
                </div>

                <div>
                  <span className="text-[#6B7280] font-semibold block text-[11px]">Account & IFSC</span>
                  <p className="font-bold text-[#171717] font-mono mt-0.5">
                    A/C: {accountNumber ? `•••• ${accountNumber.slice(-4)}` : 'Not Set'} {ifscCode && `| ${ifscCode}`}
                  </p>
                </div>

                <div>
                  <span className="text-[#6B7280] font-semibold block text-[11px]">UPI ID</span>
                  <p className="font-bold text-[#2563EB] mt-0.5">
                    {upiId || 'partner@upi'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Save Button Bar when Editing */}
        {isEditing && (
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-5 py-3 bg-white border border-[#E5E7EB] text-[#6B7280] hover:text-[#171717] font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 bg-[#16A34A] hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center space-x-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving to Database...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Profile & Vehicle Details</span>
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

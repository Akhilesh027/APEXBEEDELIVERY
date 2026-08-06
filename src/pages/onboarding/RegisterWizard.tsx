import React, { useState } from 'react';
import { useNavigate, Link } from '../../app/simpleRouter';
import { authService, type RegisterPayload } from '../../services/authService';
import { CheckCircle2, ShieldCheck, Camera, AlertCircle } from 'lucide-react';

export const RegisterWizardPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Personal
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [partnerType, setPartnerType] = useState<'Employee' | 'Freelancer'>('Employee');
  const [aadhaar, setAadhaar] = useState('');

  // Step 2: Vehicle
  const [vehicleType, setVehicleType] = useState<'Bike' | 'Car' | 'EV' | 'Bicycle' | 'Two-Wheeler'>('Bike');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [rcNumber, _setRcNumber] = useState('');
  const [license, setLicense] = useState('');
  const [licenseExpiry, setLicenseExpiry] = useState('');

  // Step 3: Bank
  const [bankName, setBankName] = useState('');
  const [bankHolder, setBankHolder] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [upiId, setUpiId] = useState('');

  // Step 4: Selfie & Verification
  const [isFaceVerified, setIsFaceVerified] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const navigate = useNavigate();

  const handleSimulateFaceScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setIsFaceVerified(true);
    }, 1200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFaceVerified) {
      setError('Please complete biometric selfie face verification before submitting.');
      return;
    }

    setLoading(true);
    setError('');

    const payload: RegisterPayload = {
      phone,
      name,
      email,
      partnerType,
      aadhaarNumber: aadhaar,
      vehicle: {
        type: vehicleType,
        number: vehicleNumber,
        rcNumber,
        drivingLicense: license,
        licenseExpiry
      },
      bankDetails: {
        accountHolderName: bankHolder || name,
        bankName,
        accountNumber: bankAccount,
        ifsc,
        upiId
      }
    };

    try {
      const res = await authService.register(payload);
      if (res.success) {
        alert(res.message || 'Registration application submitted! Status: Pending Approval.');
        navigate('/login');
      } else {
        setError(res.message || 'Registration submission failed.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit registration application.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 text-xs sm:text-sm">
      <div className="flex justify-between items-center text-xs font-bold text-[#6B7280] pb-2 border-b border-[#E5E7EB]">
        <span>ApexBee Partner Registration</span>
        <span className="text-[#F59E0B]">Step {step} of 5</span>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-[#DC2626] font-bold rounded-xl flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* STEP 1: Applicant Information */}
        {step === 1 && (
          <div className="space-y-3">
            <h3 className="font-extrabold text-[#171717] text-sm">Step 1: Applicant KYC Details</h3>
            <div>
              <label className="block text-[#171717] font-bold mb-1">Full Legal Name</label>
              <input
                type="text"
                placeholder="e.g. Guru Prasad"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 bg-[#F7F7F5] border border-[#E5E7EB] rounded-xl text-[#171717] font-semibold outline-none focus:border-[#F5B800]"
                required
              />
            </div>
            <div>
              <label className="block text-[#171717] font-bold mb-1">Mobile Phone Number</label>
              <input
                type="tel"
                placeholder="10-digit mobile"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                className="w-full p-2.5 bg-[#F7F7F5] border border-[#E5E7EB] rounded-xl text-[#171717] font-semibold outline-none focus:border-[#F5B800]"
                required
              />
            </div>
            <div>
              <label className="block text-[#171717] font-bold mb-1">Email Address</label>
              <input
                type="email"
                placeholder="guru@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 bg-[#F7F7F5] border border-[#E5E7EB] rounded-xl text-[#171717] font-semibold outline-none focus:border-[#F5B800]"
              />
            </div>
            <div>
              <label className="block text-[#171717] font-bold mb-1">Engagement Model</label>
              <select
                value={partnerType}
                onChange={(e) => setPartnerType(e.target.value as any)}
                className="w-full p-2.5 bg-[#F7F7F5] border border-[#E5E7EB] rounded-xl text-[#171717] font-semibold"
              >
                <option value="Employee">Full-Time Employee Rider</option>
                <option value="Freelancer">Gig / Freelance Delivery Partner</option>
              </select>
            </div>
            <div>
              <label className="block text-[#171717] font-bold mb-1">Aadhaar Card Number</label>
              <input
                type="text"
                placeholder="12-digit Aadhaar number"
                maxLength={12}
                value={aadhaar}
                onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, ''))}
                className="w-full p-2.5 bg-[#F7F7F5] border border-[#E5E7EB] rounded-xl text-[#171717] font-semibold outline-none focus:border-[#F5B800]"
              />
            </div>
            <button
              type="button"
              onClick={() => name && phone.length === 10 && setStep(2)}
              disabled={!name || phone.length !== 10}
              className="w-full py-3 bg-[#F5B800] disabled:bg-neutral-200 text-[#171717] font-extrabold rounded-xl shadow-xs"
            >
              Continue to Vehicle Details
            </button>
          </div>
        )}

        {/* STEP 2: Vehicle & License */}
        {step === 2 && (
          <div className="space-y-3">
            <h3 className="font-extrabold text-[#171717] text-sm">Step 2: Vehicle & Driving License</h3>
            <div>
              <label className="block text-[#171717] font-bold mb-1">Vehicle Category</label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value as any)}
                className="w-full p-2.5 bg-[#F7F7F5] border border-[#E5E7EB] rounded-xl text-[#171717] font-semibold"
              >
                <option value="Bike">Two-Wheeler / Bike</option>
                <option value="EV">Electric Vehicle (EV)</option>
                <option value="Bicycle">Bicycle</option>
              </select>
            </div>
            <div>
              <label className="block text-[#171717] font-bold mb-1">Vehicle Registration Number</label>
              <input
                type="text"
                placeholder="e.g. TS 08 AB 4582"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                className="w-full p-2.5 bg-[#F7F7F5] border border-[#E5E7EB] rounded-xl text-[#171717] font-semibold"
                required
              />
            </div>
            <div>
              <label className="block text-[#171717] font-bold mb-1">Driving License Number</label>
              <input
                type="text"
                placeholder="DL-1420110012345"
                value={license}
                onChange={(e) => setLicense(e.target.value.toUpperCase())}
                className="w-full p-2.5 bg-[#F7F7F5] border border-[#E5E7EB] rounded-xl text-[#171717] font-semibold"
                required
              />
            </div>
            <div>
              <label className="block text-[#171717] font-bold mb-1">DL Expiry Date</label>
              <input
                type="date"
                value={licenseExpiry}
                onChange={(e) => setLicenseExpiry(e.target.value)}
                className="w-full p-2.5 bg-[#F7F7F5] border border-[#E5E7EB] rounded-xl text-[#171717] font-semibold"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-2.5 bg-[#F7F7F5] border border-[#E5E7EB] text-[#171717] font-bold rounded-xl"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => vehicleNumber && license && setStep(3)}
                disabled={!vehicleNumber || !license}
                className="flex-1 py-2.5 bg-[#F5B800] disabled:bg-neutral-200 text-[#171717] font-extrabold rounded-xl"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Bank Credentials */}
        {step === 3 && (
          <div className="space-y-3">
            <h3 className="font-extrabold text-[#171717] text-sm">Step 3: Bank Payout Credentials</h3>
            <div>
              <label className="block text-[#171717] font-bold mb-1">Bank Name</label>
              <input
                type="text"
                placeholder="e.g. HDFC Bank"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full p-2.5 bg-[#F7F7F5] border border-[#E5E7EB] rounded-xl text-[#171717] font-semibold"
                required
              />
            </div>
            <div>
              <label className="block text-[#171717] font-bold mb-1">Account Holder Name</label>
              <input
                type="text"
                placeholder={name || 'Account holder name'}
                value={bankHolder}
                onChange={(e) => setBankHolder(e.target.value)}
                className="w-full p-2.5 bg-[#F7F7F5] border border-[#E5E7EB] rounded-xl text-[#171717] font-semibold"
              />
            </div>
            <div>
              <label className="block text-[#171717] font-bold mb-1">Account Number</label>
              <input
                type="text"
                placeholder="Bank account number"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                className="w-full p-2.5 bg-[#F7F7F5] border border-[#E5E7EB] rounded-xl text-[#171717] font-semibold"
                required
              />
            </div>
            <div>
              <label className="block text-[#171717] font-bold mb-1">IFSC Code</label>
              <input
                type="text"
                placeholder="e.g. HDFC0001102"
                value={ifsc}
                onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                className="w-full p-2.5 bg-[#F7F7F5] border border-[#E5E7EB] rounded-xl text-[#171717] font-semibold"
                required
              />
            </div>
            <div>
              <label className="block text-[#171717] font-bold mb-1">Linked UPI VPA ID</label>
              <input
                type="text"
                placeholder="guru@upi"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full p-2.5 bg-[#F7F7F5] border border-[#E5E7EB] rounded-xl text-[#171717] font-semibold"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 py-2.5 bg-[#F7F7F5] border border-[#E5E7EB] text-[#171717] font-bold rounded-xl"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => bankName && bankAccount && ifsc && setStep(4)}
                disabled={!bankName || !bankAccount || !ifsc}
                className="flex-1 py-2.5 bg-[#F5B800] disabled:bg-neutral-200 text-[#171717] font-extrabold rounded-xl"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Face Verification */}
        {step === 4 && (
          <div className="space-y-4 text-center">
            <h3 className="font-extrabold text-[#171717] text-sm">Step 4: Biometric Face Verification</h3>
            <p className="text-xs text-[#6B7280]">Take a quick selfie scan for account safety and driver identity audit.</p>

            <div className="bg-[#F7F7F5] border-2 border-dashed border-[#E5E7EB] rounded-2xl p-6 flex flex-col items-center justify-center space-y-3">
              {isFaceVerified ? (
                <div className="text-[#16A34A] space-y-1">
                  <ShieldCheck className="h-12 w-12 mx-auto text-[#16A34A]" />
                  <span className="font-extrabold text-sm block">Face Scan Verified ✅</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleSimulateFaceScan}
                  disabled={isScanning}
                  className="py-3 px-5 bg-[#171717] text-white font-bold text-xs rounded-xl flex items-center space-x-2 hover:bg-neutral-800 cursor-pointer"
                >
                  <Camera className="h-4 w-4 text-[#F5B800]" />
                  <span>{isScanning ? 'Scanning Face...' : 'Scan Selfie Face Verification'}</span>
                </button>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 py-2.5 bg-[#F7F7F5] border border-[#E5E7EB] text-[#171717] font-bold rounded-xl"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => isFaceVerified && setStep(5)}
                disabled={!isFaceVerified}
                className="flex-1 py-2.5 bg-[#F5B800] disabled:bg-neutral-200 text-[#171717] font-extrabold rounded-xl"
              >
                Review & Submit
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Final Review & Submit */}
        {step === 5 && (
          <div className="space-y-4 text-center">
            <CheckCircle2 className="h-10 w-10 text-[#16A34A] mx-auto" />
            <h3 className="font-extrabold text-[#171717] text-base">Submit Registration Application</h3>
            <div className="bg-[#F7F7F5] border border-[#E5E7EB] rounded-xl p-3.5 text-xs text-left space-y-1.5">
              <p><strong>Applicant:</strong> {name} ({phone})</p>
              <p><strong>Engagement:</strong> {partnerType} Rider</p>
              <p><strong>Vehicle:</strong> {vehicleType} ({vehicleNumber})</p>
              <p><strong>Bank Payout:</strong> {bankName} (A/C ****{bankAccount.slice(-4)})</p>
              <p><strong>Face Scan:</strong> Verified ✅</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#16A34A] hover:bg-emerald-700 disabled:bg-neutral-300 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {loading ? 'Submitting Application...' : 'Confirm & Submit Application'}
            </button>
          </div>
        )}
      </form>

      <div className="text-center pt-2 border-t border-[#E5E7EB]">
        <Link to="/login" className="text-[#2563EB] font-bold text-xs hover:underline">
          Already registered? Sign In →
        </Link>
      </div>
    </div>
  );
};

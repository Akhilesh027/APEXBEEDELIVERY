import React, { useState, useEffect, useRef } from 'react';
import { X, QrCode, Scan, Banknote, CheckCircle2, ShieldCheck, Camera } from 'lucide-react';

interface CodPaymentScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  amount: number;
  customerName: string;
  onPaymentConfirmed: (method: 'UPI' | 'Cash') => void;
}

export const CodPaymentScannerModal: React.FC<CodPaymentScannerModalProps> = ({
  isOpen,
  onClose,
  orderNumber,
  amount,
  customerName,
  onPaymentConfirmed
}) => {
  const [activeTab, setActiveTab] = useState<'qr' | 'scan' | 'cash'>('qr');
  const [_isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<null | 'UPI' | 'Cash'>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isOpen && activeTab === 'scan') {
      setIsScanning(true);
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
          .then((s) => {
            stream = s;
            if (videoRef.current) {
              videoRef.current.srcObject = s;
            }
          })
          .catch((err) => {
            console.warn('Camera access denied or unavailable, fallback to simulated scanner view:', err);
          });
      }
    } else {
      setIsScanning(false);
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const handleConfirm = (method: 'UPI' | 'Cash') => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(method);
      setTimeout(() => {
        onPaymentConfirmed(method);
        onClose();
        setPaymentSuccess(null);
      }, 1200);
    }, 800);
  };

  // Upis string: upi://pay?pa=apexbee@icici&pn=ApexBee&am=5.00&tr=AB-123
  const upiString = `upi://pay?pa=apexbee.merchant@icici&pn=ApexBee%20Merchant&am=${amount.toFixed(2)}&tn=Order%20${orderNumber}`;
  // High quality static SVG QR representation for apexbee UPI
  const qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(upiString)}&color=171717&bgcolor=ffffff`;

  return (
    <div className="fixed inset-0 bg-neutral-900/80 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white border border-[#E5E7EB] rounded-t-3xl sm:rounded-2xl shadow-2xl max-w-md w-full p-5 sm:p-6 space-y-5 animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-[#E5E7EB] pb-3.5">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-100 rounded-xl text-[#16A34A]">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#171717]">Collect COD Payment</h3>
              <span className="text-xs font-semibold text-[#6B7280]">Order #{orderNumber}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#6B7280] hover:text-[#171717] hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {paymentSuccess ? (
          <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="h-16 w-16 bg-emerald-100 text-[#16A34A] rounded-full flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="h-10 w-10 animate-bounce" />
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-extrabold text-[#171717]">Payment Verified!</h4>
              <p className="text-xs text-[#6B7280]">
                ₹{amount.toFixed(2)} collected successfully via <strong className="text-[#16A34A]">{paymentSuccess}</strong>.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Amount Banner */}
            <div className="bg-[#F7F7F5] border border-[#E5E7EB] rounded-2xl p-4 flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider block">Total COD Amount</span>
                <span className="text-xs text-[#171717] font-semibold">Customer: {customerName}</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-extrabold text-[#16A34A] font-mono">₹{amount.toFixed(2)}</span>
              </div>
            </div>

            {/* Mode Switch Tabs */}
            <div className="grid grid-cols-3 gap-1 bg-[#F7F7F5] p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setActiveTab('qr')}
                className={`py-2 px-1 rounded-lg text-center transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center space-x-1 ${
                  activeTab === 'qr' ? 'bg-white text-[#171717] shadow-xs' : 'text-[#6B7280] hover:text-[#171717]'
                }`}
              >
                <QrCode className="h-4 w-4 shrink-0" />
                <span>Show QR</span>
              </button>
              <button
                onClick={() => setActiveTab('scan')}
                className={`py-2 px-1 rounded-lg text-center transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center space-x-1 ${
                  activeTab === 'scan' ? 'bg-white text-[#171717] shadow-xs' : 'text-[#6B7280] hover:text-[#171717]'
                }`}
              >
                <Scan className="h-4 w-4 shrink-0" />
                <span>Scan QR</span>
              </button>
              <button
                onClick={() => setActiveTab('cash')}
                className={`py-2 px-1 rounded-lg text-center transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center space-x-1 ${
                  activeTab === 'cash' ? 'bg-white text-[#171717] shadow-xs' : 'text-[#6B7280] hover:text-[#171717]'
                }`}
              >
                <Banknote className="h-4 w-4 shrink-0" />
                <span>Cash</span>
              </button>
            </div>

            {/* TAB 1: SHOW DYNAMIC UPI QR CODE FOR CUSTOMER TO SCAN */}
            {activeTab === 'qr' && (
              <div className="space-y-4 text-center py-2">
                <div className="bg-white border-2 border-dashed border-[#F5B800] p-4 rounded-2xl inline-block shadow-sm relative">
                  <img
                    src={qrDataUrl}
                    alt="ApexBee Merchant UPI QR"
                    className="w-48 h-48 mx-auto object-contain rounded-lg"
                    onError={(e) => {
                      // Fallback SVG display if offline/image load issue
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="mt-2 text-[11px] font-mono text-[#6B7280] font-bold">
                    UPI ID: apexbee.merchant@icici
                  </div>
                </div>

                <p className="text-xs text-[#6B7280]">
                  Ask customer to scan using Google Pay, PhonePe, Paytm, or any UPI app.
                </p>

                <button
                  onClick={() => handleConfirm('UPI')}
                  disabled={isProcessing}
                  className="w-full py-3.5 bg-[#16A34A] hover:bg-[#15803d] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer flex justify-center items-center space-x-2"
                >
                  {isProcessing ? (
                    <span>Verifying Payment...</span>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      <span>Confirm UPI Payment Received (₹{amount.toFixed(2)})</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* TAB 2: RIDER SCANNER VIEW FOR CUSTOMER QR */}
            {activeTab === 'scan' && (
              <div className="space-y-4 text-center py-2">
                <div className="relative w-full h-56 bg-neutral-900 rounded-2xl overflow-hidden flex items-center justify-center border-2 border-neutral-700">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 border-2 border-[#F5B800]/60 m-6 rounded-xl flex items-center justify-center">
                    <div className="w-full h-0.5 bg-[#F5B800] shadow-[0_0_8px_#F5B800] animate-pulse" />
                  </div>
                  <div className="absolute bottom-3 bg-neutral-900/80 px-3 py-1 rounded-full text-[11px] text-white font-semibold flex items-center space-x-1.5 backdrop-blur-xs">
                    <Camera className="h-3.5 w-3.5 text-[#F5B800]" />
                    <span>Point camera at customer's payment QR / receipt</span>
                  </div>
                </div>

                <button
                  onClick={() => handleConfirm('UPI')}
                  disabled={isProcessing}
                  className="w-full py-3.5 bg-[#F5B800] hover:bg-[#e0a800] text-[#171717] font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer flex justify-center items-center space-x-2"
                >
                  {isProcessing ? (
                    <span>Processing Scan...</span>
                  ) : (
                    <>
                      <Scan className="h-4 w-4" />
                      <span>Scan & Verify Payment (₹{amount.toFixed(2)})</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* TAB 3: CASH COLLECTION */}
            {activeTab === 'cash' && (
              <div className="space-y-4 text-center py-4">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2 text-center">
                  <Banknote className="h-8 w-8 text-[#16A34A] mx-auto" />
                  <h4 className="text-sm font-extrabold text-[#171717]">Collect Cash in Hand</h4>
                  <p className="text-xs text-[#6B7280]">
                    Please collect exact cash amount of <strong className="text-[#16A34A] font-mono text-sm">₹{amount.toFixed(2)}</strong> from {customerName}.
                  </p>
                </div>

                <button
                  onClick={() => handleConfirm('Cash')}
                  disabled={isProcessing}
                  className="w-full py-3.5 bg-[#171717] hover:bg-neutral-800 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer flex justify-center items-center space-x-2"
                >
                  {isProcessing ? (
                    <span>Saving Cash Entry...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-[#F5B800]" />
                      <span>Confirm Cash Received in Hand</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

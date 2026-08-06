import React, { useRef, useState } from 'react';

interface OtpInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  error?: string;
  disabled?: boolean;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  length = 4,
  onComplete,
  error,
  disabled = false
}) => {
  const [digits, setDigits] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (disabled) return;
    const cleanValue = value.replace(/\D/g, '');
    if (!cleanValue) {
      const updated = [...digits];
      updated[index] = '';
      setDigits(updated);
      return;
    }

    const lastChar = cleanValue[cleanValue.length - 1];
    const updated = [...digits];
    updated[index] = lastChar;
    setDigits(updated);

    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    const fullOtp = updated.join('');
    if (fullOtp.length === length && !updated.includes('')) {
      onComplete(fullOtp);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-center gap-3">
        {digits.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => { inputRefs.current[idx] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            disabled={disabled}
            className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-extrabold font-mono rounded-xl border-2 transition-all outline-none ${
              error
                ? 'border-[#DC2626] bg-red-50 text-[#DC2626]'
                : digit
                ? 'border-[#171717] bg-white text-[#171717] shadow-xs'
                : 'border-[#E5E7EB] bg-[#F7F7F5] text-[#171717] focus:border-[#F5B800] focus:bg-white'
            }`}
          />
        ))}
      </div>
      {error && <p className="text-xs font-bold text-[#DC2626] text-center mt-1.5">{error}</p>}
    </div>
  );
};

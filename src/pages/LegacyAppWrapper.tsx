import React from 'react';
import LegacyApp from '../LegacyApp';

export const LegacyAppWrapper: React.FC = () => {
  return (
    <div className="min-h-screen">
      <div className="bg-amber-50 border-b border-amber-200 p-2 text-center text-xs font-bold text-amber-900 sticky top-0 z-50">
        ⚠️ You are viewing the Legacy Portal (`/legacy`). Navigate to <a href="/app/home" className="underline font-extrabold">/app/home</a> for the redesigned portal.
      </div>
      <LegacyApp />
    </div>
  );
};

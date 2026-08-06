import React from 'react';
import { Navigate } from './simpleRouter';
import { useAppStore } from '../store/useAppStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('delivery_token') : null;
  const partner = useAppStore((state) => state.partner);

  // Require token AND partner status must be 'active'
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (partner && partner.status === 'pending_approval') {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

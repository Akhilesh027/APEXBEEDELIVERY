import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from './simpleRouter';
import { AuthLayout } from '../layouts/AuthLayout';
import { AppShell } from '../layouts/AppShell';
import { ProtectedRoute } from './ProtectedRoute';

// Pages
import { LoginPage } from '../pages/auth/Login';
import { RegisterWizardPage } from '../pages/onboarding/RegisterWizard';
import { HomeDashboard } from '../pages/home/HomeDashboard';
import { OrdersListPage } from '../pages/orders/OrdersList';
import { OrderOfferPage } from '../pages/orders/OrderOffer';
import { ActiveDeliveryPage } from '../pages/orders/ActiveDelivery';
import { DeliverySuccessPage } from '../pages/orders/DeliverySuccess';
import { SubscriptionsListPage } from '../pages/subscriptions/SubscriptionsList';
import { EarningsPage } from '../pages/earnings/Earnings';
import { WalletPage } from '../pages/wallet/Wallet';
import { AttendancePage } from '../pages/attendance/Attendance';
import { PerformancePage } from '../pages/performance/Performance';
import { NotificationsPage } from '../pages/notifications/Notifications';
import { ProfilePage } from '../pages/profile/Profile';
import { SupportPage } from '../pages/support/Support';
import { LegacyAppWrapper } from '../pages/LegacyAppWrapper';

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth & Onboarding Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/verify-otp" element={<LoginPage />} />
          <Route path="/register" element={<RegisterWizardPage />} />
          <Route path="/register/*" element={<RegisterWizardPage />} />
          <Route path="/application-status" element={<LoginPage />} />
        </Route>

        {/* Protected App Routes */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/app/home" replace />} />
          <Route path="home" element={<HomeDashboard />} />

          {/* Orders Routes */}
          <Route path="orders" element={<OrdersListPage />} />
          <Route path="orders/offer" element={<OrderOfferPage />} />
          <Route path="orders/active/:orderId" element={<ActiveDeliveryPage />} />
          <Route path="orders/success" element={<DeliverySuccessPage />} />
          <Route path="orders/:orderId" element={<ActiveDeliveryPage />} />

          {/* Subscriptions */}
          <Route path="subscriptions" element={<SubscriptionsListPage />} />
          <Route path="subscriptions/:id" element={<SubscriptionsListPage />} />

          {/* Earnings & Wallet */}
          <Route path="earnings" element={<EarningsPage />} />
          <Route path="wallet" element={<WalletPage />} />
          <Route path="wallet/withdraw" element={<WalletPage />} />
          <Route path="settlements" element={<WalletPage />} />

          {/* Attendance & Leave */}
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="attendance/history" element={<AttendancePage />} />
          <Route path="leave" element={<AttendancePage />} />

          {/* Performance & Notifications */}
          <Route path="performance" element={<PerformancePage />} />
          <Route path="notifications" element={<NotificationsPage />} />

          {/* Profile */}
          <Route path="profile" element={<ProfilePage />} />
          <Route path="profile/*" element={<ProfilePage />} />

          {/* Support & Settings */}
          <Route path="support" element={<SupportPage />} />
          <Route path="settings" element={<SupportPage />} />
        </Route>

        {/* Root Redirect */}
        <Route path="/" element={<Navigate to="/app/home" replace />} />

        {/* Legacy App Fallback */}
        <Route path="/legacy" element={<LegacyAppWrapper />} />

        {/* Catch-all Redirect */}
        <Route path="*" element={<Navigate to="/app/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
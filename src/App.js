// Main Application Component
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Page Component Imports
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PricingPage from './pages/PricingPage';
import BlogPostPage from './pages/BlogPostPage';
import GuidePage from './pages/GuidePage';
import ConfirmRegisterPage from './pages/ConfirmRegisterPage';

import ProfilePage from './pages/ProfilePage';
import UpdateProfilePage from './pages/UpdateProfilePage';
import TicketPage from './pages/TicketPage';
import TopUpPage from './pages/TopUpPage';
import TopUpHistoryPage from './pages/TopUpHistoryPage';
import TestHistoryPage from './pages/TestHistoryPage';
import PaymentSuccess from './pages/PaymentSuccess';

import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminTicketsPage from "./pages/AdminTicketsPage";
import AdminReportsPage from './pages/AdminReportsPage';
import AdminTopupHistoryPage from './pages/AdminTopupHistoryPage';
import AdminVoucherPage from './pages/AdminVoucherPage';

import StaffDashboardPage from './pages/StaffDashboardPage';
import StaffPage from './pages/StaffPage';

import { UserProvider } from './UserContext';

function App() {
  return (
    <UserProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/blog" element={<BlogPostPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/guide" element={<GuidePage />} />
            <Route path="/confirm-register" element={<ConfirmRegisterPage />} />
            
            {/* Authenticated User Routes */}
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/update-profile" element={<UpdateProfilePage />} />
            <Route path="/ticket" element={<TicketPage />} />
            <Route path="/topup" element={<TopUpPage />} />
            <Route path="/topup-history" element={<TopUpHistoryPage />} />
            <Route path="/test-history" element={<TestHistoryPage />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/tickets" element={<AdminTicketsPage />} />
            <Route path="/admin/reports" element={<AdminReportsPage />} />
            <Route path="/admin/settings" element={<AdminDashboardPage />} />
            <Route path="/admin/topup-history" element={<AdminTopupHistoryPage />} />
            <Route path="/admin/voucher" element={<AdminVoucherPage />} />

            {/* Staff Routes */}
            <Route path="/staff/dashboard" element={<StaffDashboardPage />} />
            <Route path="/staff/requests" element={<StaffPage />} />
          </Routes>
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;

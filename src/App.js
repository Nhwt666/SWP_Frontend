import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TicketPage from './pages/TicketPage';
import GuidePage from './pages/GuidePage';
import PaymentSuccess from './pages/PaymentSuccess';
import TopUpPage from './pages/TopUpPage';
import UpdateProfilePage from './pages/UpdateProfilePage';
import TopUpHistoryPage from './pages/TopUpHistoryPage';
import TestHistoryPage from './pages/TestHistoryPage';
import Layout from './components/Layout';
import ProfilePage from './pages/ProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import PricingPage from './pages/PricingPage';
import AdminUsersPage from './pages/AdminUsersPage';
import StaffDashboardPage from './pages/StaffDashboardPage';
import BlogPostPage from './pages/BlogPostPage';
import StaffPage from './pages/StaffPage';
import AdminTicketsPage from "./pages/AdminTicketsPage";

function App() {
    return (
        <Router>
            <Routes>
                <Route element={<Layout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/ticket" element={<TicketPage />} />
                    <Route path="/guide" element={<GuidePage />} />
                    <Route path="/payment-success" element={<PaymentSuccess />} />
                    <Route path="/topup" element={<TopUpPage />} />
                    <Route path="/update-profile" element={<UpdateProfilePage />} />
                    <Route path="/topup-history" element={<TopUpHistoryPage />} />
                    <Route path="/test-history" element={<TestHistoryPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                    <Route path="/pricing" element={<PricingPage />} />
                    <Route path="/admin/users" element={<AdminUsersPage />} />
                    <Route path="/staff/dashboard" element={<StaffDashboardPage />} />
                    <Route path="/blog/:slug" element={<BlogPostPage />} />
                    <Route path="/staff/requests" element={<StaffPage />} />
                    <Route path="/admin/tickets" element={<AdminTicketsPage />} />
                </Route>

                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
            </Routes>
        </Router>
    );
}

export default App;

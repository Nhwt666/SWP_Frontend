import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TicketPage from './pages/TicketPage';
import GuidePage from './pages/GuidePage';
import PaymentSuccess from './pages/PaymentSuccess';
import ForgotPassword from './pages/ForgotPassword';
import TopUpPage from './pages/TopUpPage';  // Thêm dòng này

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/ticket" element={<TicketPage />} />
                <Route path="/guide" element={<GuidePage />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/topup" element={<TopUpPage />} />  {/* Thêm dòng này */}
            </Routes>
        </Router>
    );
}

export default App;

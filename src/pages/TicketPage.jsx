import React, { useState, useEffect, useContext } from 'react';
import '../styles/TicketPage.css';
import { UserContext } from '../UserContext';
import Notification from '../components/Notification';

const pricingData = {
    'Xác minh quyền thừa kế': 1200000,
    'Xác minh quan hệ huyết thống': 1500000,
    'Giám định ADN cho con nuôi': 1000000,
    'Xác minh danh tính': 1300000,
    'Xác minh quyền lợi bảo hiểm': 1600000,
    'Xác minh quyền thừa kế trong di chúc': 1700000,
    'Khác': 900000,
};

const TicketPage = () => {
    const [category, setCategory] = useState('');
    const [service, setService] = useState('');
    const [customReason, setCustomReason] = useState('');
    const [method, setMethod] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState(null);
    const [price, setPrice] = useState(0);
    const [userInfo, setUserInfo] = useState({
        address: '',
        phone: '',
        email: '',
    });
    const { wallet, updateFullName, updateWallet } = useContext(UserContext);
    const [notify, setNotify] = useState({ type: '', message: '' });
    const [confirmModal, setConfirmModal] = useState({ open: false, amount: 0, resolve: null });

    const civilServices = [
        'Xác minh quyền thừa kế',
        'Xác minh quan hệ huyết thống',
        'Giám định ADN cho con nuôi',
    ];

    const adminServices = [
        'Xác minh danh tính',
        'Xác minh quyền lợi bảo hiểm',
        'Xác minh quyền thừa kế trong di chúc',
    ];

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const res = await fetch('/auth/me', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                if (res.ok) {
                    const user = await res.json();
                    setUserId(user.userId || user.id || null);
                    setUserInfo({
                        address: user.address || '',
                        phone: user.phone || '',
                        email: user.email || '',
                    });
                } else {
                    console.error('Không thể lấy thông tin người dùng.');
                }
            } catch (err) {
                console.error('Lỗi lấy thông tin người dùng:', err);
            }
        };
        fetchUserInfo();
    }, []);

    useEffect(() => {
        if (method === 'Tự gửi mẫu') {
            setAddress(userInfo.address);
            setPhone(userInfo.phone);
            setEmail(userInfo.email);
        } else {
            setAddress('');
            setPhone('');
            setEmail('');
        }
    }, [method, userInfo]);

    useEffect(() => {
        let calculated = 0;
        if (category === 'Khác') {
            calculated = pricingData['Khác'];
        } else if (service && pricingData[service]) {
            calculated = pricingData[service];
        }
        setPrice(calculated);
    }, [category, service]);

    useEffect(() => {
        if (notify.message) {
            const timer = setTimeout(() => setNotify({ type: '', message: '' }), 3000);
            return () => clearTimeout(timer);
        }
    }, [notify]);

    const showConfirm = (amount) => {
        return new Promise((resolve) => {
            setConfirmModal({ open: true, amount, resolve });
        });
    };

    const payFunction = async (amount) => {
        return await showConfirm(amount);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!userId) {
            setNotify({ type: 'error', message: 'Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.' });
            setLoading(false);
            return;
        }
        if (wallet < price) {
            setNotify({ type: 'error', message: '❌ Số dư ví không đủ để thanh toán!' });
            setLoading(false);
            return;
        }
        setLoading(true);

        const typeMap = {
            'Dân sự': 'CIVIL',
            'Hành chính': 'ADMINISTRATIVE',
            'Khác': 'OTHER',
        };

        const methodMap = {
            'Tự gửi mẫu': 'SELF_TEST',
            'Tại cơ sở y tế': 'AT_FACILITY',
        };

        const ticketData = {
            type: typeMap[category],
            method: methodMap[method],
            reason: service || customReason,
            address: method === 'Tự gửi mẫu' ? address : null,
            phone: method === 'Tự gửi mẫu' ? phone : null,
            email: method === 'Tự gửi mẫu' ? email : null,
            customerId: userId,
            amount: price, // <-- Đổi từ cost thành amount
          };

        try {
            // 1. Gọi API thanh toán trước
            const paymentSuccess = await payFunction(price);
            if (!paymentSuccess) {
                setNotify({ type: 'error', message: '❌ Thanh toán thất bại hoặc bị huỷ. Không tạo ticket.' });
                setLoading(false);
                return;
            }
            // 2. Chỉ khi thanh toán thành công mới lưu ticket
            const res = await fetch('/tickets/after-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(ticketData),
            });

            if (res.ok) {
                const ticket = await res.json();
                const history = JSON.parse(localStorage.getItem('ticketHistory')) || [];
                history.push(ticket.id);
                localStorage.setItem('ticketHistory', JSON.stringify(history));
                // Cập nhật lại số dư ví realtime
                try {
                    const resUser = await fetch('/auth/me', {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    });
                    if (resUser.ok) {
                        const user = await resUser.json();
                        updateFullName(user.fullName);
                        updateWallet(user.walletBalance);
                    }
                } catch {}
                setNotify({ type: 'success', message: `🎉 Ticket đã được tạo thành công!` });
                resetForm();
            } else {
                const errText = await res.text();
                setNotify({ type: 'error', message: `❌ Tạo ticket thất bại: ${errText || 'Lỗi không xác định'}` });
            }
        } catch (err) {
            console.error('Lỗi:', err);
            setNotify({ type: 'error', message: '❌ Không thể kết nối đến máy chủ' });
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setCategory('');
        setService('');
        setCustomReason('');
        setMethod('');
        setAddress('');
        setPhone('');
        setEmail('');
        setPrice(0);
    };

    return (
        <div className="ticket-page">
            <h2>Tạo Đơn Yêu Cầu Xét Nghiệm</h2>
            <Notification
                type={notify.type}
                message={notify.message}
                onClose={() => setNotify({ type: '', message: '' })}
            />
            {confirmModal.open && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
                }}>
                    <div style={{
                        background: '#fff', borderRadius: 10, padding: 32, minWidth: 320, maxWidth: '90vw', boxShadow: '0 2px 16px rgba(0,0,0,0.2)', textAlign: 'center'
                    }}>
                        <div style={{ fontSize: 32, marginBottom: 12 }}>💸</div>
                        <div style={{ fontSize: 18, marginBottom: 24 }}>
                            Xác nhận thanh toán <b>{confirmModal.amount.toLocaleString('vi-VN')}</b> VND?
                        </div>
                        <button
                            style={{ background: '#34c759', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 24px', fontSize: 16, marginRight: 12, cursor: 'pointer' }}
                            onClick={() => {
                                confirmModal.resolve(true);
                                setConfirmModal({ ...confirmModal, open: false });
                            }}
                        >Xác nhận</button>
                        <button
                            style={{ background: '#eee', color: '#333', border: 'none', borderRadius: 6, padding: '8px 24px', fontSize: 16, cursor: 'pointer' }}
                            onClick={() => {
                                confirmModal.resolve(false);
                                setConfirmModal({ ...confirmModal, open: false });
                            }}
                        >Huỷ</button>
                    </div>
                </div>
            )}
            <form onSubmit={handleSubmit}>
                <label>Chọn loại yêu cầu:</label>
                <select
                    value={category}
                    onChange={(e) => {
                        setCategory(e.target.value);
                        setService('');
                        setCustomReason('');
                    }}
                    required
                >
                    <option value="">-- Chọn --</option>
                    <option value="Dân sự">Dân sự</option>
                    <option value="Hành chính">Hành chính</option>
                    <option value="Khác">Yêu cầu khác</option>
                </select>

                {(category === 'Dân sự' || category === 'Hành chính') && (
                    <>
                        <label>Chọn dịch vụ:</label>
                        <select value={service} onChange={(e) => setService(e.target.value)} required>
                            <option value="">-- Chọn dịch vụ --</option>
                            {(category === 'Dân sự' ? civilServices : adminServices).map((srv, idx) => (
                                <option key={idx} value={srv}>{srv}</option>
                            ))}
                        </select>
                    </>
                )}

                {category === 'Khác' && (
                    <>
                        <label>Lý do cần xét nghiệm:</label>
                        <textarea
                            value={customReason}
                            onChange={(e) => setCustomReason(e.target.value)}
                            rows="4"
                            placeholder="Nhập lý do cụ thể..."
                            required
                        />
                    </>
                )}

                <label>Phương thức xét nghiệm:</label>
                <select value={method} onChange={(e) => setMethod(e.target.value)} required>
                    <option value="">-- Chọn phương thức --</option>
                    <option value="Tự gửi mẫu">Tự gửi mẫu</option>
                    <option value="Tại cơ sở y tế">Tại cơ sở y tế</option>
                </select>

                {method === 'Tự gửi mẫu' && (
                    <>
                        <label>Địa chỉ nhận mẫu:</label>
                        <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} required />
                        <label>Số điện thoại liên hệ:</label>
                        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                        <label>Email liên hệ:</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </>
                )}

                <div style={{ marginTop: '20px', fontWeight: 'bold', color: '#004aad', fontSize: '18px' }}>
                    💰 Tổng chi phí: {price.toLocaleString('vi-VN')} VND
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? 'Đang tạo...' : 'Tạo Đơn'}
                </button>
            </form>
        </div>
    );
};

export default TicketPage;

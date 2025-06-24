import React, { useState, useEffect, useContext } from 'react';
import '../styles/TicketPage.css';
import { UserContext } from '../UserContext';
import TicketCreateModal from '../components/TicketCreateModal';
import TicketEditModal from '../components/TicketEditModal';
import Header from '../components/Header';

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
    const [sample1Name, setSample1Name] = useState('');
    const [sample2Name, setSample2Name] = useState('');
    const [appointmentDate, setAppointmentDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState(null);
    const [price, setPrice] = useState(0);
    const [userInfo, setUserInfo] = useState({
        address: '',
        phone: '',
        email: '',
    });
    const { wallet, updateFullName, updateWallet } = useContext(UserContext);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAmount, setConfirmAmount] = useState(0);
    const [confirmResolve, setConfirmResolve] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

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

    const showConfirm = (amount) => {
        return new Promise((resolve) => {
            setConfirmAmount(amount);
            setShowConfirmModal(true);
            setConfirmResolve(() => resolve);
        });
    };

    const handleConfirm = () => {
        setShowConfirmModal(false);
        if (confirmResolve) confirmResolve(true);
    };
    const handleCancel = () => {
        setShowConfirmModal(false);
        if (confirmResolve) confirmResolve(false);
    };

    const payFunction = async (amount) => {
        return await showConfirm(amount);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!userId) {
            setErrorMsg('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
            setShowErrorModal(true);
            setLoading(false);
            return;
        }

        if (wallet < price) {
            setErrorMsg('❌ Số dư ví không đủ để thanh toán!');
            setShowErrorModal(true);
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
            appointmentDate: method === 'Tại cơ sở y tế' ? appointmentDate : null,
            sample1Name: sample1Name,
            sample2Name: sample2Name,
            customerId: userId,
            amount: price,
            status: 'PENDING',
        };

        try {
            const paymentSuccess = await payFunction(price);
            if (!paymentSuccess) {
                alert('❌ Thanh toán thất bại hoặc bị huỷ. Không tạo ticket.');
                setLoading(false);
                return;
            }

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
                setShowSuccessModal(true);
                resetForm();
            } else {
                const errText = await res.text();
                alert(`❌ Tạo ticket thất bại: ${errText || 'Lỗi không xác định'}`);
            }
        } catch (err) {
            console.error('Lỗi:', err);
            alert('❌ Không thể kết nối đến máy chủ');
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
        setSample1Name('');
        setSample2Name('');
        setAppointmentDate('');
        setPrice(0);
    };

    return (
        <>
            <Header />
            <div className="ticket-page">
                <div className="ticket-form-container">
                    <h2 className="ticket-title">Tạo Đơn Yêu Cầu Xét Nghiệm</h2>
                    <form onSubmit={handleSubmit} className="ticket-form" autoComplete="off">
                        <div className="form-group">
                            <label htmlFor="category">Chọn loại yêu cầu:</label>
                            <select
                                id="category"
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
                        </div>

                        {(category === 'Dân sự' || category === 'Hành chính') && (
                            <div className="form-group">
                                <label htmlFor="service">Chọn dịch vụ:</label>
                                <select
                                    id="service"
                                    value={service}
                                    onChange={(e) => setService(e.target.value)}
                                    required
                                >
                                    <option value="">-- Chọn dịch vụ --</option>
                                    {(category === 'Dân sự' ? civilServices : adminServices).map((srv, idx) => (
                                        <option key={idx} value={srv}>{srv}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {category === 'Khác' && (
                            <div className="form-group">
                                <label htmlFor="customReason">Lý do cần xét nghiệm:</label>
                                <textarea
                                    id="customReason"
                                    value={customReason}
                                    onChange={(e) => setCustomReason(e.target.value)}
                                    rows="4"
                                    placeholder="Nhập lý do..."
                                    required
                                />
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="method">Chọn phương thức lấy mẫu:</label>
                            <select
                                id="method"
                                value={method}
                                onChange={(e) => setMethod(e.target.value)}
                                required
                            >
                                <option value="">-- Chọn phương thức --</option>
                                <option value="Tự gửi mẫu">Tự gửi mẫu</option>
                                <option value="Tại cơ sở y tế">Tại cơ sở y tế</option>
                            </select>
                        </div>

                        {method === 'Tự gửi mẫu' && (
                            <div className="method-details">
                                <div className="form-group">
                                    <label htmlFor="address"><strong>Địa chỉ nhận mẫu:</strong></label>
                                    <input
                                        id="address"
                                        type="text"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder="Nhập địa chỉ nhận mẫu"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="phone"><strong>Số điện thoại:</strong></label>
                                    <input
                                        id="phone"
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="Nhập số điện thoại"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="email"><strong>Email:</strong></label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Nhập email"
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        {method === 'Tại cơ sở y tế' && (
                            <div className="form-group">
                                <label htmlFor="appointmentDate"><strong>Chọn ngày hẹn:</strong></label>
                                <input
                                    id="appointmentDate"
                                    type="date"
                                    value={appointmentDate}
                                    onChange={(e) => setAppointmentDate(e.target.value)}
                                    required
                                    className="date-picker"
                                />
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="sample1Name"><strong>Tên Mẫu 1:</strong></label>
                            <input
                                id="sample1Name"
                                type="text"
                                value={sample1Name}
                                onChange={(e) => setSample1Name(e.target.value)}
                                placeholder="Nhập tên người cung cấp mẫu 1"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="sample2Name"><strong>Tên Mẫu 2:</strong></label>
                            <input
                                id="sample2Name"
                                type="text"
                                value={sample2Name}
                                onChange={(e) => setSample2Name(e.target.value)}
                                placeholder="Nhập tên người cung cấp mẫu 2"
                                required
                            />
                        </div>

                        <div className="price-display">
                            Giá dịch vụ: {price > 0 ? price.toLocaleString('vi-VN') + ' VNĐ' : '--'}
                        </div>

                        <button className="submit-btn" type="submit" disabled={loading}>
                            {loading ? 'Đang xử lý...' : 'Tạo yêu cầu'}
                        </button>
                    </form>
                </div>
            </div>
            
            {/* Footer with Map */}
            <footer className="member-footer">
                <div className="member-footer-content">
                    <div className="member-footer-info">
                        <div><strong>Số Hotline:</strong> 1800.9999</div>
                        <div><strong>Email:</strong> trungtamxetnghiem@gmail.com</div>
                        <div><strong>Địa chỉ:</strong> 643 Điện Biên Phủ, Phường 1, Quận 3, TPHCM</div>
                    </div>
                    <div className="member-footer-map">
                        <iframe
                            title="Bản đồ Trung tâm xét nghiệm ADN"
                            src="https://www.google.com/maps?q=643+Điện+Biên+Phủ,+Phường+1,+Quận+3,+TPHCM&output=embed"
                            width="250"
                            height="140"
                            style={{ border: 0, borderRadius: 10 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                    </div>
                </div>
            </footer>
            
            {showConfirmModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
                }}>
                    <div style={{
                        background: '#fff', borderRadius: 16, padding: 36, minWidth: 320, maxWidth: 380,
                        boxShadow: '0 4px 32px rgba(30,58,138,0.18)', textAlign: 'center', position: 'relative'
                    }}>
                        <div style={{ marginBottom: 18 }}>
                            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{marginBottom: 8}}>
                                <rect x="4" y="12" width="40" height="24" rx="8" fill="#e0f2fe"/>
                                <rect x="4" y="12" width="40" height="24" rx="8" stroke="#22c55e" strokeWidth="2"/>
                                <circle cx="24" cy="24" r="6" fill="#fff" stroke="#22c55e" strokeWidth="2"/>
                                <text x="24" y="28" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#22c55e">₫</text>
                            </svg>
                        </div>
                        <div style={{ fontSize: 18, marginBottom: 18 }}>
                            Xác nhận thanh toán <b style={{ fontSize: 22 }}>{confirmAmount.toLocaleString('vi-VN')}</b> VNĐ?
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
                            <button
                                onClick={handleConfirm}
                                style={{
                                    background: '#22c55e', color: '#fff', border: 'none', borderRadius: 8,
                                    padding: '10px 28px', fontWeight: 700, fontSize: 16, cursor: 'pointer',
                                    boxShadow: '0 2px 8px rgba(34,197,94,0.10)', transition: 'background 0.2s',
                                }}
                                onMouseOver={e => e.currentTarget.style.background = '#16a34a'}
                                onMouseOut={e => e.currentTarget.style.background = '#22c55e'}
                            >Xác nhận</button>
                            <button
                                onClick={handleCancel}
                                style={{
                                    background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 8,
                                    padding: '10px 28px', fontWeight: 600, fontSize: 16, cursor: 'pointer',
                                    boxShadow: '0 2px 8px rgba(30,58,138,0.06)', transition: 'background 0.2s',
                                }}
                                onMouseOver={e => e.currentTarget.style.background = '#e5e7eb'}
                                onMouseOut={e => e.currentTarget.style.background = '#f3f4f6'}
                            >Huỷ</button>
                        </div>
                    </div>
                </div>
            )}
            {showSuccessModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
                }}>
                    <div style={{
                        background: '#fff', borderRadius: 16, padding: 36, minWidth: 320, maxWidth: 380,
                        boxShadow: '0 4px 32px rgba(30,58,138,0.18)', textAlign: 'center', position: 'relative'
                    }}>
                        <div style={{ marginBottom: 18 }}>
                            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{marginBottom: 8}}>
                                <circle cx="24" cy="24" r="20" fill="#e8f5e8"/>
                                <path d="M20 24l4 4 8-8" stroke="#22c55e" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <div style={{ fontSize: 18, marginBottom: 18 }}>
                            ✅ Yêu cầu đã được tạo thành công!
                        </div>
                        <div style={{ fontSize: 14, color: '#666', marginBottom: 24 }}>
                            Chúng tôi sẽ liên hệ với bạn sớm nhất có thể.
                        </div>
                        <button
                            onClick={() => {
                                setShowSuccessModal(false);
                                resetForm();
                            }}
                            style={{
                                background: '#22c55e', color: '#fff', border: 'none', borderRadius: 8,
                                padding: '10px 28px', fontWeight: 700, fontSize: 16, cursor: 'pointer',
                                boxShadow: '0 2px 8px rgba(34,197,94,0.10)', transition: 'background 0.2s',
                            }}
                            onMouseOver={e => e.currentTarget.style.background = '#16a34a'}
                            onMouseOut={e => e.currentTarget.style.background = '#22c55e'}
                        >Đóng</button>
                    </div>
                </div>
            )}
            {showErrorModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
                }}>
                    <div style={{
                        background: '#fff', borderRadius: 16, padding: 36, minWidth: 320, maxWidth: 380,
                        boxShadow: '0 4px 32px rgba(30,58,138,0.18)', textAlign: 'center', position: 'relative'
                    }}>
                        <div style={{ marginBottom: 18 }}>
                            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{marginBottom: 8}}>
                                <circle cx="24" cy="24" r="20" fill="#fee2e2"/>
                                <path d="M18 18l12 12m0-12l-12 12" stroke="#ef4444" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <div style={{ fontSize: 18, marginBottom: 18, color: '#ef4444' }}>
                            ❌ Có lỗi xảy ra!
                        </div>
                        <div style={{ fontSize: 14, color: '#666', marginBottom: 24 }}>
                            {errorMsg}
                        </div>
                        <button
                            onClick={() => setShowErrorModal(false)}
                            style={{
                                background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8,
                                padding: '10px 28px', fontWeight: 700, fontSize: 16, cursor: 'pointer',
                                boxShadow: '0 2px 8px rgba(239,68,68,0.10)', transition: 'background 0.2s',
                            }}
                            onMouseOver={e => e.currentTarget.style.background = '#dc2626'}
                            onMouseOut={e => e.currentTarget.style.background = '#ef4444'}
                        >Đóng</button>
                    </div>
                </div>
            )}
        </>
    );
};

export default TicketPage;

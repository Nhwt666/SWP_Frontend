import React, { useState, useEffect, useContext } from 'react';
import '../styles/TicketPage.css';
import { UserContext } from '../UserContext';

const pricingData = {
    'Xác minh quyền thừa kế': 1200000,
    'Xác minh quan hệ huyết thống': 1500000,
    'Giám định ADN cho con nuôi': 1000000,
    'Xác minh danh tính': 1300000,
    'Xác minh quyền lợi bảo hiểm': 1600000,
    'Xác minh quyền thừa kế trong di chúc': 1700000,
    'Khác': 900000,
};

const thirdSamplePricing = {
    'Xác minh quyền thừa kế': 1000000,
    'Xác minh quan hệ huyết thống': 1250000,
    'Giám định ADN cho con nuôi': 1000000,
    'Xác minh danh tính': 1300000,
    'Xác minh quyền lợi bảo hiểm': 1600000,
    'Xác minh quyền thừa kế trong di chúc': 1700000,
    'Khác': 900000,
    // You can adjust/add more if needed
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
    const [addThirdSample, setAddThirdSample] = useState(false);
    const { wallet, updateFullName, updateWallet } = useContext(UserContext);

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
        if (addThirdSample && service && thirdSamplePricing[service]) {
            calculated += thirdSamplePricing[service];
        }
        setPrice(calculated);
    }, [category, service, addThirdSample]);

    const showConfirm = (amount) => {
        return new Promise((resolve) => {
            if (window.confirm(`Xác nhận thanh toán ${amount.toLocaleString('vi-VN')} VNĐ?`)) {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    };

    const payFunction = async (amount) => {
        return await showConfirm(amount);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!userId) {
            alert('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
            setLoading(false);
            return;
        }

        if (wallet < price) {
            alert('❌ Số dư ví không đủ để thanh toán!');
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
            amount: price,
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
                alert('🎉 Ticket đã được tạo thành công!');
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
        setPrice(0);
        setAddThirdSample(false);
    };

    return (
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

                    {/* Add Third Sample Checkbox - Redesigned */}
                    <div className="add-third-sample-box" tabIndex={0}>
                        <input
                            type="checkbox"
                            id="addThirdSample"
                            className="add-third-sample-checkbox"
                            checked={addThirdSample}
                            onChange={e => setAddThirdSample(e.target.checked)}
                        />
                        <label htmlFor="addThirdSample" className="add-third-sample-label">
                            <span className="add-third-sample-icon" role="img" aria-label="sample">🧬</span>
                            Thêm mẫu thứ 3
                        </label>
                    </div>

                    <div className="price-display">
                        Service Price: {price > 0 ? price.toLocaleString('vi-VN') + ' VNĐ' : '--'}
                    </div>

                    <button className="submit-btn" type="submit" disabled={loading}>
                        {loading ? 'Đang xử lý...' : 'Tạo yêu cầu'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default TicketPage;

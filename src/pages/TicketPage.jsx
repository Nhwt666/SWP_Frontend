import React, { useState } from 'react';
import '../styles/TicketPage.css';

const TicketPage = () => {
    const [category, setCategory] = useState('');
    const [service, setService] = useState('');
    const [customReason, setCustomReason] = useState('');
    const [method, setMethod] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');

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

    const handleSubmit = (e) => {
        e.preventDefault();

        const ticketData = {
            category,
            service,
            customReason,
            method,
            ...(method === 'Tự gửi mẫu' && { address, phone, email }),
        };

        console.log(ticketData);
        alert('Ticket đã được tạo thành công!');
    };

    return (
        <div className="ticket-page">
            <h2>Tạo Đơn Yêu Cầu Xét Nghiệm</h2>
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
                        <select
                            value={service}
                            onChange={(e) => setService(e.target.value)}
                            required
                        >
                            <option value="">-- Chọn dịch vụ --</option>
                            {(category === 'Dân sự' ? civilServices : adminServices).map(
                                (srv, idx) => (
                                    <option key={idx} value={srv}>
                                        {srv}
                                    </option>
                                )
                            )}
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
                <select
                    value={method}
                    onChange={(e) => {
                        setMethod(e.target.value);
                        setAddress('');
                        setPhone('');
                        setEmail('');
                    }}
                    required
                >
                    <option value="">-- Chọn phương thức --</option>
                    <option value="Tự gửi mẫu">Tự gửi mẫu</option>
                    <option value="Tại cơ sở y tế">Tại cơ sở y tế</option>
                </select>

                {method === 'Tự gửi mẫu' && (
                    <>
                        <label>Địa chỉ nhận mẫu:</label>
                        <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Nhập địa chỉ nhận mẫu"
                            required
                        />

                        <label>Số điện thoại liên hệ:</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Nhập số điện thoại"
                            required
                        />

                        <label>Email liên hệ:</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Nhập email"
                            required
                        />
                    </>
                )}

                {method === 'Tự gửi mẫu' && (
                    <div className="method-details">
                        <ul>
                            <li>Đăng ký lịch xét nghiệm</li>
                            <li>Thanh toán phí xét nghiệm</li>
                            <li>Hướng dẫn tự thu mẫu & đợi bộ kit gửi về</li>
                            <li>Gửi mẫu về cơ sở</li>
                            <li>Theo dõi trạng thái gửi mẫu</li>
                            <li>Thông báo khi mẫu được nhận</li>
                            <li>Đợi kết quả và đánh giá trong ticket</li>
                        </ul>
                    </div>
                )}

                {method === 'Tại cơ sở y tế' && (
                    <div className="method-details">
                        <ul>
                            <li>Đăng ký lịch xét nghiệm</li>
                            <li>Thanh toán phí xét nghiệm</li>
                            <li>Nhân viên thu thập mẫu tại chỗ</li>
                            <li>Đợi kết quả và đánh giá trong ticket</li>
                        </ul>
                    </div>
                )}

                <button type="submit" className="submit-btn">
                    Tạo Đơn
                </button>
            </form>
        </div>
    );
};

export default TicketPage;

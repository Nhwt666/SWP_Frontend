import React from 'react';
import '../styles/PricingPage.css';

const PricingPage = () => {
    return (
        <div className="pricing-page">
            <div className="pricing-container">
                <h1 className="pricing-title">Bảng Giá Xét Nghiệm ADN</h1>

                <section className="pricing-section">
                    <h2 className="pricing-section-title">Huyết Thống Cha – Con, Mẹ – Con Dân Sự</h2>
                    <div className="pricing-table-wrap">
                        <table className="pricing-table">
                            <thead>
                                <tr>
                                    <th>QUY CÁCH</th>
                                    <th>THỜI GIAN</th>
                                    <th>CHI PHÍ (VNĐ)</th>
                                    <th>THÊM MẪU THỨ 3</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr><td>Tiêu Chuẩn</td><td>02 Ngày</td><td>2.500.000</td><td>1.250.000</td></tr>
                                <tr><td>Làm Nhanh</td><td>06 – 08 Tiếng</td><td>5.000.000</td><td>2.500.000</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <ul className="pricing-note-list">
                        <li>Giá trên áp dụng cho mẫu niêm mạc miệng và máu.</li>
                        <li>Đối với mẫu tóc, móng tay, chân, cuống rốn, cộng thêm <strong>500.000 VNĐ</strong>/ trường hợp.</li>
                        <li>Đối với các mẫu đặc biệt (dao cạo râu, đầu lọc thuốc lá, bã kẹo cao su, bàn chải đánh răng, mẫu tinh trùng) cộng thêm <strong>2.000.000 VNĐ</strong>/ trường hợp. Trong trường hợp 2 mẫu đều là mẫu đặc biệt thì cộng thêm <strong>500.000 VNĐ</strong>.</li>
                    </ul>
                </section>

                <section className="pricing-section">
                    <h2 className="pricing-section-title">Huyết Thống Cha – Con, Mẹ – Con Hành Chính Khai Sinh</h2>
                    <div className="pricing-table-wrap">
                        <table className="pricing-table">
                            <thead>
                                <tr><th>QUY CÁCH</th><th>THỜI GIAN</th><th>CHI PHÍ (VNĐ)</th><th>THÊM MẪU THỨ 3</th></tr>
                            </thead>
                            <tbody>
                                <tr><td>Tiêu chuẩn</td><td>02 Ngày</td><td>3.500.000</td><td>1.750.000</td></tr>
                                <tr><td>Làm Nhanh</td><td>06 – 08 Tiếng</td><td>6.000.000</td><td>3.000.000</td></tr>
                                <tr><td>Cần hợp pháp hóa lãnh sự</td><td>7 Ngày</td><td>5.000.000</td><td>-</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="pricing-note">Đối với xét nghiệm thủ tục hành chính chỉ sử dụng mẫu máu hoặc mẫu niêm mạc miệng.</div>
                </section>

                <section className="pricing-section">
                    <h2 className="pricing-section-title">Xét Nghiệm ADN Theo Dòng Cha (Dân Sự)</h2>
                    <div className="pricing-table-wrap">
                        <table className="pricing-table">
                            <thead>
                                <tr><th>QUY CÁCH</th><th>THỜI GIAN</th><th>CHI PHÍ (VNĐ)</th><th>THÊM MẪU THỨ 3</th></tr>
                            </thead>
                            <tbody>
                                <tr><td>Tiêu chuẩn</td><td>05 Ngày</td><td>4.000.000</td><td>2.000.000</td></tr>
                                <tr><td>Làm Nhanh</td><td>03 Ngày</td><td>6.500.000</td><td>3.250.000</td></tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="pricing-section">
                    <h2 className="pricing-section-title">Xét Nghiệm ADN Theo Dòng Cha (Hành Chính)</h2>
                    <div className="pricing-table-wrap">
                        <table className="pricing-table">
                            <thead>
                                <tr><th>QUY CÁCH</th><th>THỜI GIAN</th><th>CHI PHÍ (VNĐ)</th><th>THÊM MẪU THỨ 3</th></tr>
                            </thead>
                            <tbody>
                                <tr><td>Tiêu chuẩn</td><td>05 Ngày</td><td>5.000.000</td><td>2.500.000</td></tr>
                                <tr><td>Làm Nhanh</td><td>03 Ngày</td><td>7.500.000</td><td>3.750.000</td></tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="pricing-section">
                    <h2 className="pricing-section-title">Xét Nghiệm ADN Theo Dòng Mẹ</h2>
                    <div className="pricing-table-wrap">
                        <table className="pricing-table">
                            <thead>
                                <tr><th>LOẠI</th><th>THỜI GIAN</th><th>CHI PHÍ (VNĐ)</th><th>THÊM MẪU THỨ 3</th></tr>
                            </thead>
                            <tbody>
                                <tr><td>ADN Ty thể (Dân sự)</td><td>07 Ngày</td><td>4.000.000</td><td>2.000.000</td></tr>
                                <tr><td>ADN Ty thể (Hành chính)</td><td>07 Ngày</td><td>5.000.000</td><td>2.500.000</td></tr>
                                <tr><td>Giám định hài cốt</td><td>30 Ngày</td><td>7.000.000</td><td>3.500.000</td></tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <div className="pricing-summary">
                    <p>Giá xét nghiệm ADN từ <strong>3.000.000 VNĐ</strong> đến <strong>6.000.000 VNĐ</strong>. Chi phí cho một lần Xét Nghiệm ADN làm nhanh giao động từ <strong>5.500.000 VNĐ</strong> đến <strong>8.500.000 VNĐ</strong>.</p>
                    <p><strong>Ghi chú:</strong> Trường hợp làm thủ tục hành chính, pháp lý sẽ do nhân viên trung tâm trực tiếp thu mẫu. Vui lòng xem hướng dẫn thủ tục xét nghiệm ADN.</p>
                </div>
            </div>
        </div>
    );
};

export default PricingPage;

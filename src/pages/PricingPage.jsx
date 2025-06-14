import React from 'react';
import '../styles/PricingPage.css';

const PricingPage = () => {
    return (
        <div className="pricing-page">
            <h2>CHI PHÍ GIÁ XÉT NGHIỆM ADN HUYẾT THỐNG CHA – CON, MẸ – CON DÂN SỰ</h2>
            <table>
                <thead>
                <tr>
                    <th>QUY CÁCH</th>
                    <th>THỜI GIAN</th>
                    <th>CHI PHÍ(VNĐ)</th>
                    <th>THÊM MẪU THỨ 3</th>
                </tr>
                </thead>
                <tbody>
                <tr><td>Tiêu Chuẩn</td><td>02 Ngày</td><td>2.500.000</td><td>1.250.000</td></tr>
                <tr><td>Làm Nhanh</td><td>06 – 08 Tiếng</td><td>5.000.000</td><td>2.500.000</td></tr>
                </tbody>
            </table>
            <p>Giá trên áp dụng cho mẫu niêm mạc miệng và máu.</p>
            <p>Đối với mẫu tóc, móng tay, chân, cuống rốn, cộng thêm 500.000 VNĐ/ trường hợp.</p>
            <p>Đối với các mẫu đặc biệt (dao cạo râu, đầu lọc thuốc lá, bã kẹo cao su, bàn chải đánh răng, mẫu tinh trùng) cộng thêm 2.000.000 VNĐ/ trường hợp. Trong trường hợp 2 mẫu đều là mẫu đặc biệt thì cộng thêm 500.000 VNĐ.</p>

            <h2>CHI PHÍ GIÁ XÉT NGHIỆM ADN HUYẾT THỐNG CHA – CON, MẸ – CON HÀNH CHÍNH KHAI SINH</h2>
            <table>
                <thead>
                <tr><th>QUY CÁCH</th><th>THỜI GIAN</th><th>CHI PHÍ(VNĐ)</th><th>THÊM MẪU THỨ 3</th></tr>
                </thead>
                <tbody>
                <tr><td>Tiêu chuẩn</td><td>02 Ngày</td><td>3.500.000</td><td>1.750.000</td></tr>
                <tr><td>Làm Nhanh</td><td>06 – 08 Tiếng</td><td>6.000.000</td><td>3.000.000</td></tr>
                <tr><td>Cần hợp pháp hóa lãnh sự</td><td>7 Ngày</td><td>5.000.000</td><td>-</td></tr>
                </tbody>
            </table>
            <p>Đối với xét nghiệm thủ tục hành chính chỉ sử dụng mẫu máu hoặc mẫu niêm mạc miệng.</p>

            <h2>CHI PHÍ GIÁ XÉT NGHIỆM ADN THEO DÒNG CHA (DÂN SỰ)</h2>
            <table>
                <thead>
                <tr><th>QUY CÁCH</th><th>THỜI GIAN</th><th>CHI PHÍ(VNĐ)</th><th>THÊM MẪU THỨ 3</th></tr>
                </thead>
                <tbody>
                <tr><td>Tiêu chuẩn</td><td>05 Ngày</td><td>4.000.000</td><td>2.000.000</td></tr>
                <tr><td>Làm Nhanh</td><td>03 Ngày</td><td>6.500.000</td><td>3.250.000</td></tr>
                </tbody>
            </table>

            <h2>CHI PHÍ GIÁ XÉT NGHIỆM ADN THEO DÒNG CHA (HÀNH CHÍNH)</h2>
            <table>
                <thead>
                <tr><th>QUY CÁCH</th><th>THỜI GIAN</th><th>CHI PHÍ(VNĐ)</th><th>THÊM MẪU THỨ 3</th></tr>
                </thead>
                <tbody>
                <tr><td>Tiêu chuẩn</td><td>05 Ngày</td><td>5.000.000</td><td>2.500.000</td></tr>
                <tr><td>Làm Nhanh</td><td>03 Ngày</td><td>7.500.000</td><td>3.750.000</td></tr>
                </tbody>
            </table>

            <h2>CHI PHÍ GIÁ XÉT NGHIỆM ADN THEO DÒNG MẸ</h2>
            <table>
                <thead>
                <tr><th>LOẠI</th><th>THỜI GIAN</th><th>CHI PHÍ(VNĐ)</th><th>THÊM MẪU THỨ 3</th></tr>
                </thead>
                <tbody>
                <tr><td>ADN Ty thể (Dân sự)</td><td>07 Ngày</td><td>4.000.000</td><td>2.000.000</td></tr>
                <tr><td>ADN Ty thể (Hành chính)</td><td>07 Ngày</td><td>5.000.000</td><td>2.500.000</td></tr>
                <tr><td>Giám định hài cốt</td><td>30 Ngày</td><td>7.000.000</td><td>3.500.000</td></tr>
                </tbody>
            </table>

            <p>Giá xét nghiệm ADN từ 3.000.000 VNĐ đến 6.000.000 VNĐ. Chi phí cho một lần Xét Nghiệm ADN làm nhanh giao động từ 5.500.000 VNĐ đến 8.500.000 VNĐ.</p>
            <p><strong>Ghi chú:</strong> Trường hợp làm thủ tục hành chính, pháp lý sẽ do nhân viên trung tâm trực tiếp thu mẫu. Vui lòng xem hướng dẫn thủ tục xét nghiệm ADN.</p>
        </div>
    );
};

export default PricingPage;

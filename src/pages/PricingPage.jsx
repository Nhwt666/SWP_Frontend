import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import '../styles/PricingPage.css';

const PricingPage = () => {
    const [prices, setPrices] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPrices = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch('/api/prices');
                if (!res.ok) throw new Error('Không thể tải dữ liệu bảng giá');
                const data = await res.json();
                setPrices(data);
                console.log('Fetched prices:', data);
            } catch (err) {
                setError(err.message || 'Lỗi không xác định');
            } finally {
                setLoading(false);
            }
        };
        fetchPrices();
    }, []);


    const headers = [
        { key: 'id', label: 'STT' },
        { key: 'value', label: 'GIÁ TRỊ' },
        { key: 'currency', label: 'TIỀN TỆ' },
        { key: 'name', label: 'TÊN DỊCH VỤ' },
        { key: 'type', label: 'LOẠI' },
    ];

    return (
        <>
            <Header />
            <div className="pricing-page">
                <div className="pricing-container">
                    <h1 className="pricing-title">Bảng Giá Xét Nghiệm ADN</h1>
                    {loading && <div>Đang tải dữ liệu...</div>}
                    {error && <div style={{color: 'red'}}>Lỗi: {error}</div>}
                    {!loading && !error && prices && Array.isArray(prices) && prices.length > 0 && (
                        <section className="pricing-section">
                            <div className="pricing-table-wrap">
                                <table className="pricing-table">
                                    <thead>
                                    <tr>
                                        {headers.map(h => (
                                            <th key={h.key}>{h.label}</th>
                                        ))}
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {prices.map((row, i) => (
                                        <tr key={row.id || i}>
                                            {headers.map(h => (
                                                <td key={h.key}>
                                                    {h.key === 'type' ? (
                                                        row[h.key] === 'CIVIL' ? 'Dân Sự' :
                                                        row[h.key] === 'ADMINISTRATIVE' ? 'Hành Chính' :
                                                        'Khác'
                                                    ) : h.key === 'value' ? (
                                                        Number(row[h.key]).toLocaleString('vi-VN')
                                                    ) : row[h.key]}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}
                    {!loading && !error && (!prices || prices.length === 0) && (
                        <div>Không có dữ liệu bảng giá.</div>
                    )}
                </div>
            </div>

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
        </>
    );
};

export default PricingPage;

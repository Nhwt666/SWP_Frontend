import React, { useEffect, useState } from 'react';
import { vfs } from '../fonts/RobotoVFS.js';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

// Đăng ký fonts mặc định trước
pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs;

// Sau đó merge với font Roboto Việt hóa
pdfMake.vfs = { ...pdfMake.vfs, ...vfs };

// Đăng ký font Roboto
pdfMake.fonts = {
    Roboto: {
        normal: 'Roboto-Regular.ttf',
        bold: 'Roboto-Regular.ttf',
        italics: 'Roboto-Regular.ttf',
        bolditalics: 'Roboto-Regular.ttf'
    }
};

const statusMap = {
    PENDING: 'Đang chờ xử lý',
    IN_PROGRESS: 'Đang xử lý',
    DONE: 'Hoàn thành',
    COMPLETED: 'Hoàn thành',
};

const methodMap = {
    SELF_TEST: 'Tự gửi mẫu',
    AT_FACILITY: 'Tại cơ sở y tế',
    // Thêm các phương thức khác nếu có
};

const typeDisplayMap = {
    'CIVIL': 'Dân sự',
    'ADMINISTRATIVE': 'Hành chính',
    'OTHER': 'Yêu cầu khác'
};

const TestHistoryPage = () => {
    const [history, setHistory] = useState([]);
    const [message, setMessage] = useState('');
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [staffList, setStaffList] = useState([]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                // Gọi đúng endpoint BE: /tickets/history (dựa vào token)
                const historyRes = await fetch('/tickets/history', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                if (!historyRes.ok) throw new Error('Không thể tải lịch sử xét nghiệm');
                const data = await historyRes.json();
                setHistory(data);
            } catch (err) {
                setMessage(err.message || 'Lỗi khi tải lịch sử xét nghiệm');
            }
        };
        const fetchStaff = async () => {
            try {
                const res = await fetch('/admin/users/role/STAFF', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setStaffList(data);
                }
            } catch (error) {
                console.error("Failed to fetch staff list", error);
            }
        };
        fetchHistory();
        fetchStaff();
    }, []);

    const handleRowClick = (item) => {
        setSelectedTicket(item);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedTicket(null);
    };

    const getStaffName = (staffId) => {
        if (!staffId || !staffList.length) return 'Chưa có';
        const staffMember = staffList.find(staff => staff.id === staffId);
        return staffMember ? staffMember.fullName : 'Không xác định';
    };

    const getDisplayResult = (resultStr) => {
        if (!resultStr || resultStr === 'Chưa có') return 'Chưa có';
        try {
            const parsed = JSON.parse(resultStr);
            if (parsed && typeof parsed === 'object' && parsed.result) {
                return parsed.result;
            }
            return parsed;
        } catch (e) {
            return resultStr;
        }
    };

    const getResultInfo = (resultStr) => {
        const details = getDisplayResult(resultStr);
        if (details === 'Chưa có' || !details) {
            return { conclusion: 'Chưa có', details: 'Chưa có' };
        }
        
        const detailsLower = String(details).toLowerCase();
        
        const isMatch = detailsLower && (
            (detailsLower.includes('trùng khớp') && !detailsLower.includes('không')) || 
            (detailsLower.includes('có quan hệ huyết thống') && !detailsLower.includes('không')) ||
            (detailsLower.includes('xác suất') && (detailsLower.includes('99.99') || detailsLower.includes('99,99'))) ||
            detailsLower.includes('99.99%') ||
            detailsLower.includes('99.999%')
        );
        const conclusion = isMatch ? 'TRÙNG KHỚP' : 'KHÔNG TRÙNG KHỚP';
        return { conclusion, details };
    };

    const generatePDFReport = async (ticket) => {
        try {
            const type = ticket.type;
            const method = methodMap[ticket.method] || ticket.method;
            const customerName = ticket.customer?.fullName || ticket.customer?.name || 'Chưa Có Thông Tin';
            const phone = ticket.customer?.phone || ticket.phone || 'Chưa Có Thông Tin';
            const email = ticket.customer?.email || ticket.email || 'Chưa Có Thông Tin';
            const { conclusion: conclusionText, details: result } = getResultInfo(ticket.resultString);
            const reason = ticket.reason || 'Chưa Có Thông Tin';
            const sample1Name = ticket.sample1Name || 'Mẫu 1';
            const sample2Name = ticket.sample2Name || 'Mẫu 2';
            const address = ticket.address || 'Chưa Có Thông Tin';
            const appointmentDate = ticket.appointmentDate ? new Date(ticket.appointmentDate).toLocaleDateString('vi-VN') : 'Chưa Có Thông Tin';
            const customerCode = `KH${ticket.id.toString().padStart(6, '0')}`;
            
            const isMatch = conclusionText === 'TRÙNG KHỚP';
            const conclusionColor = isMatch ? '#2e7d32' : '#d32f2f';

            const displayType = typeDisplayMap[type] || type;

            const docDefinition = {
                pageSize: 'A4',
                pageMargins: [40, 60, 40, 60],
                header: {
                    stack: [
                        { text: 'TRUNG TÂM XÉT NGHIỆM ADN', style: 'mainHeader' },
                        { text: 'PHIẾU TRẢ KẾT QUẢ XÉT NGHIỆM ADN', style: 'subHeader' }
                    ],
                    margin: [0, 20, 0, 0]
                },
                content: [
                    {
                        text: [
                            'Địa chỉ: 123 Đường ABC, Quận XYZ, TP.HCM\n',
                            'Số điện thoại: 028-1234-5678 | Email: info@adnlab.com\n',
                            'Website: www.adnlab.com | Giấy phép: 123456789'
                        ],
                        style: 'centerInfo',
                        alignment: 'center',
                        margin: [0, 0, 0, 30]
                    },
                    {
                        table: {
                            widths: ['*', '*'],
                            body: [
                                [
                                    {
                                        text: [
                                            { text: 'THÔNG TIN PHIẾU\n', style: 'sectionHeader' },
                                            { text: `Mã phiếu: ${ticket.id}\n`, style: 'infoText' },
                                            { text: `Mã khách hàng: ${customerCode}\n`, style: 'infoText' },
                                            { text: `Ngày gửi mẫu: ${ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString('vi-VN') : 'N/A'}\n`, style: 'infoText' },
                                            { text: `Ngày trả kết quả: ${new Date().toLocaleDateString('vi-VN')}`, style: 'infoText' }
                                        ]
                                    },
                                    {
                                        text: [
                                            { text: 'THÔNG TIN KHÁCH HÀNG\n', style: 'sectionHeader' },
                                            { text: `Họ và tên: ${customerName}\n`, style: 'infoText' },
                                            { text: `Số điện thoại: ${phone}\n`, style: 'infoText' },
                                            { text: `Email: ${email}`, style: 'infoText' }
                                        ]
                                    }
                                ]
                            ]
                        },
                        layout: 'noBorders',
                        margin: [0, 0, 0, 25]
                    },
                    { text: 'THÔNG TIN XÉT NGHIỆM', style: 'sectionHeader', margin: [0, 0, 0, 10] },
                    {
                        table: {
                            widths: ['*'],
                            body: [
                                [
                                    {
                                        text: [
                                            { text: `Loại xét nghiệm: ${displayType || 'N/A'}\n`, style: 'infoText' },
                                            { text: `Lý do xét nghiệm: ${reason}\n`, style: 'infoText' },
                                            { text: `Phương thức nhận mẫu: ${method}\n`, style: 'infoText' },
                                            { text: `Tên mẫu 1: ${sample1Name}\n`, style: 'infoText' },
                                            { text: `Tên mẫu 2: ${sample2Name}\n`, style: 'infoText' },
                                            ...(method === 'Tại cơ sở y tế' ? [{ text: `Ngày hẹn: ${appointmentDate}\n`, style: 'infoText' }] : []),
                                            ...(method === 'Tự gửi mẫu' ? [{ text: `Địa chỉ gửi mẫu: ${address}`, style: 'infoText' }] : [])
                                        ].filter(Boolean)
                                    }
                                ]
                            ]
                        },
                        layout: 'noBorders',
                        margin: [0, 0, 0, 25]
                    },
                    { text: 'KẾT QUẢ XÉT NGHIỆM', style: 'sectionHeader', margin: [0, 0, 0, 15] },
                    {
                        table: {
                            widths: ['*'],
                            body: [
                                [
                                    {
                                        text: [
                                            { text: 'Kết quả: ', style: 'resultLabel' },
                                            { text: conclusionText, color: conclusionColor, style: 'resultValue' },
                                            { text: '\n' + result.replace(/\\n/g, '\n'), style: 'resultDetails' }
                                        ],
                                        style: 'resultCell'
                                    }
                                ]
                            ]
                        },
                        layout: {
                            hLineWidth: function() { return 0; },
                            vLineWidth: function() { return 0; },
                            fillColor: function() { return '#f8f9fa'; }
                        },
                        margin: [0, 0, 0, 30]
                    },
                    { text: 'CHỮ KÝ XÁC NHẬN', style: 'sectionHeader', margin: [0, 0, 0, 15] },
                    {
                        table: {
                            widths: ['*', '*', 120],
                            body: [
                                [
                                    {
                                        text: [
                                            { text: 'Người thực hiện xét nghiệm:\n', style: 'signatureLabel' },
                                            { text: '\n\n_________________\n', style: 'signatureLine' },
                                            { text: '(Ký và ghi rõ họ tên)', style: 'signatureNote' }
                                        ],
                                        alignment: 'center'
                                    },
                                    {
                                        text: [
                                            { text: 'Người duyệt kết quả:\n', style: 'signatureLabel' },
                                            { text: '\n\n_________________\n', style: 'signatureLine' },
                                            { text: '(Ký và ghi rõ họ tên)', style: 'signatureNote' }
                                        ],
                                        alignment: 'center'
                                    },
                                    {
                                        text: [
                                            { text: 'ĐÓNG DẤU', style: 'stampText' },
                                            { text: 'TRUNG TÂM', style: 'stampText' }
                                        ],
                                        alignment: 'center',
                                        style: 'stampCell'
                                    }
                                ]
                            ]
                        },
                        layout: 'noBorders',
                        margin: [0, 0, 0, 30]
                    },
                    { text: 'GHI CHÚ QUAN TRỌNG', style: 'sectionHeader', margin: [0, 0, 0, 10] },
                    {
                        table: {
                            widths: ['*'],
                            body: [
                                [
                                    {
                                        text: [
                                            { text: '• Văn bản này chỉ có hiệu lực khi có dấu xác nhận của trung tâm\n', style: 'noteText' },
                                            { text: '• Kết quả xét nghiệm có hiệu lực trong vòng 30 ngày kể từ ngày trả kết quả\n', style: 'noteText' },
                                            { text: '• Mọi thắc mắc vui lòng liên hệ trung tâm qua số điện thoại hoặc email trên\n', style: 'noteText' },
                                            { text: '• Trung tâm không chịu trách nhiệm về việc sử dụng kết quả cho mục đích khác', style: 'noteText' }
                                        ]
                                    }
                                ]
                            ]
                        },
                        layout: 'noBorders',
                        margin: [0, 0, 0, 20]
                    }
                ],
                styles: {
                    mainHeader: { 
                        fontSize: 18, 
                        bold: true, 
                        color: '#1a237e', 
                        alignment: 'center',
                        margin: [0, 0, 0, 5]
                    },
                    subHeader: { 
                        fontSize: 14, 
                        bold: true, 
                        color: '#333333', 
                        alignment: 'center',
                        margin: [0, 0, 0, 0]
                    },
                    centerInfo: { 
                        fontSize: 9, 
                        color: '#666666', 
                        lineHeight: 1.3 
                    },
                    sectionHeader: { 
                        fontSize: 12, 
                        bold: true, 
                        color: '#1a237e', 
                        margin: [0, 0, 0, 8],
                        decoration: 'underline',
                        decorationStyle: 'solid',
                        decorationColor: '#1a237e'
                    },
                    infoText: { 
                        fontSize: 10, 
                        lineHeight: 1.4, 
                        color: '#333333',
                        margin: [0, 2, 0, 2]
                    },
                    resultLabel: { 
                        fontSize: 11, 
                        bold: true, 
                        color: '#333333' 
                    },
                    resultValue: { 
                        fontSize: 12, 
                        bold: true 
                    },
                    resultDetails: { 
                        fontSize: 10, 
                        lineHeight: 1.5, 
                        color: '#333333',
                        margin: [0, 5, 0, 0]
                    },
                    resultCell: { 
                        padding: [15, 10, 15, 10]
                    },
                    signatureLabel: { 
                        fontSize: 10, 
                        bold: true, 
                        color: '#333333' 
                    },
                    signatureLine: { 
                        fontSize: 12, 
                        color: '#333333' 
                    },
                    signatureNote: { 
                        fontSize: 8, 
                        color: '#666666',
                        italics: true
                    },
                    stampText: { 
                        fontSize: 9, 
                        bold: true, 
                        color: '#666666',
                        margin: [0, 2, 0, 2]
                    },
                    stampCell: { 
                        padding: [10, 5, 10, 5],
                        fillColor: '#f8f9fa'
                    },
                    noteText: { 
                        fontSize: 9, 
                        lineHeight: 1.3, 
                        color: '#666666',
                        margin: [0, 2, 0, 2]
                    }
                },
                defaultStyle: { font: 'Roboto' }
            };
            pdfMake.createPdf(docDefinition).download(`ket-qua-xet-nghiem-ADN-${ticket.id}.pdf`);
            toast.success('Đã tải PDF kết quả xét nghiệm!');
        } catch (error) {
            console.error('Lỗi khi tạo PDF:', error);
            toast.error('Lỗi khi tạo PDF kết quả xét nghiệm');
        }
    };

    return (
        <>
            <div className="test-history-page">
                <div className="test-history-header">
                    <h1>Lịch Sử Xét Nghiệm</h1>
                    <p>Xem lại tất cả các yêu cầu xét nghiệm của bạn</p>
                </div>

                {message ? (
                    <div className="error-container">
                        <p>❌ Lỗi: {message}</p>
                        <button onClick={() => window.location.reload()} className="retry-btn">Thử lại</button>
                    </div>
                ) : history.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📋</div>
                        <h3>Chưa có lịch sử xét nghiệm</h3>
                        <p>Bạn chưa có yêu cầu xét nghiệm nào. Hãy tạo yêu cầu đầu tiên!</p>
                        <Link to="/ticket" className="create-ticket-btn">Tạo yêu cầu xét nghiệm</Link>
                    </div>
                ) : (
                    <div className="tickets-container">
                        {history.map((item, index) => (
                            <div key={index} className="ticket-card">
                                <div className="ticket-header">
                                    <div className="ticket-id">#{item.id}</div>
                                    <div className={`ticket-status status-${item.status?.toLowerCase()}`}>
                                        {(() => {
                                            switch(item.status) {
                                                case 'PENDING': return 'Chờ xử lý';
                                                case 'IN_PROGRESS': return 'Đang xử lý';
                                                case 'COMPLETED': return 'Đã hoàn thành';
                                                case 'CANCELLED': return 'Đã hủy';
                                                default: return item.status;
                                            }
                                        })()}
                                    </div>
                                </div>
                                
                                <div className="ticket-details">
                                    <div className="detail-row">
                                        <span className="detail-label">Loại xét nghiệm:</span>
                                        <span className="detail-value">{typeDisplayMap[item.type] || item.type}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Lý do:</span>
                                        <span className="detail-value">{item.reason || 'Chưa Có Thông Tin'}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Phương thức:</span>
                                        <span className="detail-value">{methodMap[item.method] || item.method}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Ngày tạo:</span>
                                        <span className="detail-value">
                                            {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                                        </span>
                                    </div>
                                    {item.amount && (
                                        <div className="detail-row">
                                            <span className="detail-label">Chi phí:</span>
                                            <span className="detail-value amount">
                                                {Number(item.amount).toLocaleString('vi-VN')} VND
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="ticket-actions">
                                    <button 
                                        className="view-details-btn"
                                        onClick={() => handleRowClick(item)}
                                    >
                                        Xem chi tiết
                                    </button>
                                    {item.status === 'COMPLETED' && item.resultString && (
                                        <button 
                                            className="download-report-btn"
                                            onClick={() => generatePDFReport(item)}
                                        >
                                            Tải báo cáo
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
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

            {/* Ticket Detail Modal */}
            {selectedTicket && (
                <div className="modal-overlay" onClick={() => setSelectedTicket(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Chi tiết Ticket #{selectedTicket.id}</h2>
                            <button className="modal-close" onClick={() => setSelectedTicket(null)}>&times;</button>
                        </div>
                        
                        <div className="modal-body">
                            <table className="detail-table">
                                <tbody>
                                    <tr><td><b>Trạng thái:</b></td><td>{(() => {
                                        switch(selectedTicket.status) {
                                            case 'PENDING': return 'Chờ xử lý';
                                            case 'IN_PROGRESS': return 'Đang xử lý';
                                            case 'COMPLETED': return 'Đã hoàn thành';
                                            case 'CANCELLED': return 'Đã hủy';
                                            default: return selectedTicket.status;
                                        }
                                    })()}</td></tr>
                                    <tr><td><b>Loại xét nghiệm:</b></td><td>{typeDisplayMap[selectedTicket.type] || selectedTicket.type}</td></tr>
                                    <tr><td><b>Lý do:</b></td><td>{selectedTicket.reason || 'Chưa Có Thông Tin'}</td></tr>
                                    <tr><td><b>Phương thức:</b></td><td>{methodMap[selectedTicket.method] || selectedTicket.method}</td></tr>
                                    <tr><td><b>Tên mẫu 1:</b></td><td>{selectedTicket.sample1Name || ''}</td></tr>
                                    <tr><td><b>Tên mẫu 2:</b></td><td>{selectedTicket.sample2Name || ''}</td></tr>
                                    {selectedTicket.method === 'AT_FACILITY' && selectedTicket.appointmentDate && (
                                        <tr><td><b>Ngày hẹn:</b></td><td>{new Date(selectedTicket.appointmentDate).toLocaleDateString('vi-VN')}</td></tr>
                                    )}
                                    {selectedTicket.method === 'SELF_TEST' && (
                                        <>
                                            <tr><td><b>Địa chỉ:</b></td><td>{selectedTicket.address || ''}</td></tr>
                                            <tr><td><b>Email:</b></td><td>{selectedTicket.email || ''}</td></tr>
                                            <tr><td><b>Số điện thoại:</b></td><td>{selectedTicket.phone || ''}</td></tr>
                                        </>
                                    )}
                                </tbody>
                            </table>
                            <div style={{ textAlign: 'right', marginTop: 24 }}>
                                {selectedTicket.status === 'COMPLETED' && selectedTicket.resultString && (
                                    <button 
                                        className="download-report-btn"
                                        onClick={() => generatePDFReport(selectedTicket)}
                                    >
                                        Tải báo cáo PDF
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default TestHistoryPage; 
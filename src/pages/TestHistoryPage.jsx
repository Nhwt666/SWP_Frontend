import React, { useEffect, useState } from 'react';
import { vfs } from '../fonts/RobotoVFS.js';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { toast } from 'react-toastify';
import '../styles/TestHistoryPage.css';
import Header from '../components/Header';

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
    REJECTED: 'Đã từ chối',
};

const methodMap = {
    SELF_TEST: 'Tự gửi mẫu',
    AT_FACILITY: 'Tại cơ sở y tế',
    // Thêm các phương thức khác nếu có
};

const TestHistoryPage = () => {
    const [history, setHistory] = useState([]);
    const [message, setMessage] = useState('');
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [staffList, setStaffList] = useState([]);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [feedbackRating, setFeedbackRating] = useState(5);
    const [feedbackComment, setFeedbackComment] = useState('');
    const [feedbackLoading, setFeedbackLoading] = useState(false);
    const [feedbackError, setFeedbackError] = useState('');
    const [feedbackSuccess, setFeedbackSuccess] = useState('');

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
            const customerName = ticket.customer?.fullName || ticket.customer?.name || 'N/A';
            const phone = ticket.customer?.phone || ticket.phone || 'N/A';
            const email = ticket.customer?.email || ticket.email || 'N/A';
            const { conclusion: conclusionText, details: result } = getResultInfo(ticket.resultString);
            const reason = ticket.reason || 'N/A';
            const sample1Name = ticket.sample1Name || 'Mẫu 1';
            const sample2Name = ticket.sample2Name || 'Mẫu 2';
            const address = ticket.address || 'N/A';
            const appointmentDate = ticket.appointmentDate ? new Date(ticket.appointmentDate).toLocaleDateString('vi-VN') : 'N/A';
            const customerCode = `KH${ticket.id.toString().padStart(6, '0')}`;
            
            const isMatch = conclusionText === 'TRÙNG KHỚP';
            const conclusionColor = isMatch ? '#2e7d32' : '#d32f2f';

            const typeDisplayMap = {
                'CIVIL': 'Dân sự',
                'ADMINISTRATIVE': 'Hành chính',
                'OTHER': 'Khác'
            };
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

    // Helper to check if feedback exists (assume feedback property or null)
    const hasFeedback = (ticket) => {
        // Adjust this if your ticket object has a different way to check feedback
        return ticket.feedback != null;
    };

    // Open feedback modal
    const openFeedbackModal = () => {
        setFeedbackRating(5);
        setFeedbackComment('');
        setFeedbackError('');
        setFeedbackSuccess('');
        setShowFeedbackModal(true);
    };
    // Close feedback modal
    const closeFeedbackModal = () => {
        setShowFeedbackModal(false);
    };
    // Submit feedback
    const handleSubmitFeedback = async () => {
        if (!feedbackRating || feedbackRating < 1 || feedbackRating > 5) {
            setFeedbackError('Vui lòng chọn số sao từ 1 đến 5.');
            return;
        }
        setFeedbackLoading(true);
        setFeedbackError('');
        setFeedbackSuccess('');
        try {
            const res = await fetch(`/customer/tickets/${selectedTicket.id}/feedback`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ rating: feedbackRating, feedback: feedbackComment })
            });
            if (!res.ok) {
                let data;
                try {
                    data = await res.json();
                } catch {
                    data = await res.text();
                }
                setFeedbackError((data && data.message) || data || 'Gửi phản hồi thất bại.');
            } else {
                setFeedbackSuccess('Gửi phản hồi thành công!');
                // Optionally update ticket in history to reflect feedback
                setHistory(prev => prev.map(t => t.id === selectedTicket.id ? { ...t, feedback: { rating: feedbackRating, feedback: feedbackComment } } : t));
                setTimeout(() => {
                    setShowFeedbackModal(false);
                }, 1200);
            }
        } catch (err) {
            setFeedbackError('Lỗi khi gửi phản hồi.');
        } finally {
            setFeedbackLoading(false);
        }
    };

    return (
        <>
            <Header />
            <div className="test-history-page" style={{ padding: '20px' }}>
                <div className="test-history-header">
                    <h1>Lịch sử xét nghiệm</h1>
                    <p className="test-history-desc">Xem lại tất cả các yêu cầu xét nghiệm và kết quả của bạn.</p>
                </div>
                {message && <p style={{ color: 'red' }}>{message}</p>}
                {history.length === 0 && !message ? (
                    <p>Không có dữ liệu xét nghiệm.</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                        <tr>
                            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Ngày</th>
                            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Loại xét nghiệm</th>
                            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Phương thức</th>
                            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Kết quả</th>
                            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Trạng thái</th>
                            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Xem chi tiết</th>
                        </tr>
                        </thead>
                        <tbody>
                        {history.map((item, index) => (
                            <tr key={index}>
                                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : ''}</td>
                                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{item.reason || ''}</td>
                                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{methodMap[item.method] || item.method || ''}</td>
                                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{item.resultString ? getResultInfo(item.resultString).conclusion : 'Chưa có'}</td>
                                <td style={{ border: '1px solid #ccc', padding: '8px', color: item.status === 'REJECTED' ? '#e53935' : '#1976d2', fontWeight: 500 }}>{statusMap[item.status] || item.status || ''}</td>
                                <td style={{ padding: '8px' }}>
                                    <button
                                        onClick={() => handleRowClick(item)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 6,
                                            background: '#1976d2', color: '#fff', border: 'none', borderRadius: 20,
                                            padding: '6px 16px', cursor: 'pointer', fontWeight: 500, fontSize: 14,
                                            boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)', transition: 'background 0.2s',
                                        }}
                                        onMouseOver={e => e.currentTarget.style.background = '#1251a3'}
                                        onMouseOut={e => e.currentTarget.style.background = '#1976d2'}
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M2.05 12a9.94 9.94 0 0 1 19.9 0 9.94 9.94 0 0 1-19.9 0Z"/></svg>
                                        Xem lại
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}

                {showModal && selectedTicket && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                        background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                    }}>
                        <div style={{ background: '#fff', borderRadius: 8, padding: 32, minWidth: 350, maxWidth: 500, boxShadow: '0 2px 16px rgba(0,0,0,0.2)' }}>
                            <h3>Chi tiết phiếu xét nghiệm</h3>
                            <table style={{ width: '100%' }}>
                                <tbody>
                                    <tr><td><b>Ngày tạo:</b></td><td>{selectedTicket.createdAt ? new Date(selectedTicket.createdAt).toLocaleString('vi-VN') : ''}</td></tr>
                                    <tr><td><b>Loại xét nghiệm:</b></td><td>{selectedTicket.reason || ''}</td></tr>
                                    <tr><td><b>Phương thức:</b></td><td>{methodMap[selectedTicket.method] || selectedTicket.method || ''}</td></tr>
                                    <tr><td><b>Tên Mẫu 1:</b></td><td>{selectedTicket.sample1Name || ''}</td></tr>
                                    <tr><td><b>Tên Mẫu 2:</b></td><td>{selectedTicket.sample2Name || ''}</td></tr>
                                    <tr><td><b>Kết quả:</b></td><td>{getResultInfo(selectedTicket.resultString).conclusion}</td></tr>
                                    <tr><td><b>Trạng thái:</b></td><td style={selectedTicket.status === 'REJECTED' ? { color: '#e53935', fontWeight: 700 } : {}}>{statusMap[selectedTicket.status] || selectedTicket.status || ''}</td></tr>
                                    {selectedTicket.status === 'REJECTED' && (
                                        <tr>
                                            <td><b>Lý Do:</b></td>
                                            <td style={{ color: '#e53935', fontWeight: 600 }}>{selectedTicket.rejectedReason || selectedTicket.rejected_reason || 'Không có lý do'}</td>
                                        </tr>
                                    )}
                                    {selectedTicket.staffId && <tr><td><b>Nhân viên xử lý:</b></td><td>{getStaffName(selectedTicket.staffId)}</td></tr>}
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
                                        onClick={() => generatePDFReport(selectedTicket)} 
                                        style={{ 
                                            padding: '10px 20px', 
                                            background: '#4caf50', 
                                            color: '#fff', 
                                            border: 'none', 
                                            borderRadius: 6, 
                                            cursor: 'pointer', 
                                            marginRight: 10,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 6,
                                            fontWeight: 600,
                                            boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseOver={e => e.currentTarget.style.background = '#45a049'}
                                        onMouseOut={e => e.currentTarget.style.background = '#4caf50'}
                                    >
                                        📄 Tải PDF
                                    </button>
                                )}
                                {/* Feedback button: only show if COMPLETED, no feedback yet */}
                                {selectedTicket.status === 'COMPLETED' && !hasFeedback(selectedTicket) && (
                                    <button
                                        onClick={openFeedbackModal}
                                        style={{
                                            padding: '10px 20px',
                                            background: '#ff9800',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: 6,
                                            cursor: 'pointer',
                                            marginRight: 10,
                                            fontWeight: 600,
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseOver={e => e.currentTarget.style.background = '#f57c00'}
                                        onMouseOut={e => e.currentTarget.style.background = '#ff9800'}
                                    >
                                        Gửi phản hồi
                                    </button>
                                )}
                                <button 
                                    onClick={closeModal} 
                                    style={{ 
                                        padding: '10px 20px', 
                                        background: '#1976d2', 
                                        color: '#fff', 
                                        border: 'none', 
                                        borderRadius: 6, 
                                        cursor: 'pointer',
                                        fontWeight: 600,
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseOver={e => e.currentTarget.style.background = '#1565c0'}
                                    onMouseOut={e => e.currentTarget.style.background = '#1976d2'}
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Feedback Modal */}
                {showFeedbackModal && selectedTicket && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                        background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
                    }}>
                        <div style={{ background: '#fff', borderRadius: 8, padding: 28, minWidth: 320, maxWidth: 400, boxShadow: '0 2px 16px rgba(0,0,0,0.2)' }}>
                            <h3>Gửi phản hồi</h3>
                            <div style={{ marginBottom: 16 }}>
                                <label>Đánh giá:&nbsp;</label>
                                <select value={feedbackRating} onChange={e => setFeedbackRating(Number(e.target.value))} style={{ fontSize: 16, padding: 4 }}>
                                    {[5,4,3,2,1].map(star => (
                                        <option key={star} value={star}>{'★'.repeat(star)}{'☆'.repeat(5-star)}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ marginBottom: 16 }}>
                                <label>Nhận xét:</label>
                                <textarea
                                    value={feedbackComment}
                                    onChange={e => setFeedbackComment(e.target.value)}
                                    rows={4}
                                    style={{ width: '100%', fontSize: 15, padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
                                    placeholder="Nhập nhận xét của bạn (không bắt buộc)"
                                />
                            </div>
                            {feedbackError && <div style={{ color: 'red', marginBottom: 8 }}>{feedbackError}</div>}
                            {feedbackSuccess && <div style={{ color: 'green', marginBottom: 8 }}>{feedbackSuccess}</div>}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                                <button
                                    onClick={closeFeedbackModal}
                                    style={{ padding: '8px 18px', background: '#888', color: '#fff', border: 'none', borderRadius: 5, cursor: 'pointer' }}
                                    disabled={feedbackLoading}
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleSubmitFeedback}
                                    style={{ padding: '8px 18px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 5, cursor: 'pointer', fontWeight: 600 }}
                                    disabled={feedbackLoading}
                                >
                                    {feedbackLoading ? 'Đang gửi...' : 'Gửi'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
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

export default TestHistoryPage; 
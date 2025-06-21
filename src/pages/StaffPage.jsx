import { vfs } from '../fonts/RobotoVFS.js';
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import StaffLayout from '../components/StaffLayout';
import '../styles/StaffPage.css';
import { toast } from 'react-toastify';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

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

const API_BASE = '';

const tabOptions = [
    { key: 'unassigned', label: 'Chờ nhận', endpoint: '/tickets/unassigned' },
    { key: 'inprogress', label: 'Đang nhận', endpoint: '/tickets/status/IN_PROGRESS' },
    { key: 'completed', label: 'Đã hoàn thành', endpoint: '/tickets/status/COMPLETED' },
];

const StaffPage = () => {
    const [tickets, setTickets] = useState([]);
    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [statusLoading, setStatusLoading] = useState(false);
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [resultOption, setResultOption] = useState('');

    const [activeTab, setActiveTab] = useState('unassigned');

    const fetchTickets = useCallback(async (tabKey) => {
        setLoading(true);
        setError('');
        try {
            const tab = tabOptions.find(t => t.key === tabKey);
            const res = await fetch(tab.endpoint, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            if (!res.ok) throw new Error('Không thể tải danh sách yêu cầu.');
            let data = await res.json();
            data = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setTickets(data);
        } catch (err) {
            setError(err.message || 'Lỗi không xác định');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTickets(activeTab);
    }, [activeTab, fetchTickets]);

    const handleAssignSelf = async (id) => {
        setStatusLoading(true);
        try {
            const res = await fetch(`${API_BASE}/tickets/${id}/assign`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            if (!res.ok) throw new Error('Không thể nhận yêu cầu.');
            const statusRes = await fetch(`${API_BASE}/tickets/${id}/status?status=IN_PROGRESS`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            if (!statusRes.ok) throw new Error('Không thể chuyển trạng thái.');
            const updated = await statusRes.json();
            setTickets((prev) => prev.map(t => t.id === id ? updated : t));
            toast.success('Đã nhận xử lý yêu cầu và chuyển sang Đang xử lý!');
            fetchTickets(activeTab);
        } catch (err) {
            toast.error(err.message || 'Lỗi khi nhận yêu cầu');
        } finally {
            setStatusLoading(false);
        }
    };

    const getDisplayResult = (resultStr) => {
        if (!resultStr) return 'Chưa có thông tin kết quả.';
        try {
            const parsed = JSON.parse(resultStr);
            if (parsed && typeof parsed === 'object' && parsed.result) {
                return parsed.result;
            }
            return parsed.replace(/^(✅|❌)\s*Kết quả:\s*\n?/, '');
        } catch (e) {
            return resultStr.replace(/^(✅|❌)\s*Kết quả:\s*\n?/, '');
        }
    };

    const generateDetailedResult = (ticket, resultOption) => {
        if (resultOption === 'Thông tin trùng khớp') {
            const sample1Name = ticket.sample1Name || 'Mẫu 1';
            const sample2Name = ticket.sample2Name || 'Mẫu 2';
            const customReason = ticket.reason || '';
            const type = ticket.type || '';
            const reason = ticket.reason || '';
            let probability = '99.99990%';
            let testPurpose = `${customReason} giữa ${sample1Name} và ${sample2Name}.`;

            if (type === 'Dân sự' && reason.includes('thừa kế')) {
                probability = '99.99991%';
                testPurpose = `Thừa kế tài sản theo luật dân sự giữa ${sample1Name} và ${sample2Name}.`;
            } else if (type === 'Dân sự' && (reason.includes('quan hệ') || reason.includes('huyết thống'))) {
                probability = '99.99987%';
                testPurpose = `Xác minh quan hệ cha/con hoặc mẹ/con giữa ${sample1Name} và ${sample2Name}.`;
            } else if (type === 'Dân sự' && reason.includes('con nuôi')) {
                probability = '99.99987%';
                testPurpose = `Xác minh con nuôi giữa ${sample1Name} và ${sample2Name}.`;
            } else if (type === 'Hành chính' && reason.includes('danh tính')) {
                probability = '99.99972%';
                testPurpose = `Hỗ trợ xác minh danh tính hợp lệ trong hồ sơ hành chính giữa ${sample1Name} và ${sample2Name}.`;
            } else if (type === 'Hành chính' && reason.includes('bảo hiểm')) {
                probability = '99.99995%';
                testPurpose = `Cung cấp bằng chứng hợp lệ cho quyền lợi bảo hiểm giữa ${sample1Name} và ${sample2Name}.`;
            } else if (type === 'Hành chính' && reason.includes('di chúc')) {
                probability = '99.99989%';
                testPurpose = `Kiểm tra ADN phục vụ chứng thực di chúc giữa ${sample1Name} và ${sample2Name}.`;
            } else if (type === 'Khác') {
                probability = '99.99985%';
                testPurpose = `${customReason} — giữa ${sample1Name} và ${sample2Name}.`;
            }
            
            return `✔️ Có quan hệ huyết thống (xác suất ≥ 99.99%)\nTỉ lệ xác suất: ${probability}\nLý do xét nghiệm: ${testPurpose}`;
        } else if (resultOption === 'Thông tin không trùng khớp') {
            const sample1Name = ticket.sample1Name || 'Mẫu 1';
            const sample2Name = ticket.sample2Name || 'Mẫu 2';
            const customReason = ticket.reason || '';
            return `✖️ Không có quan hệ huyết thống (xác suất < 0.01%)\nTỉ lệ xác suất: 0.00001%\nLý do xét nghiệm: ${customReason} giữa ${sample1Name} và ${sample2Name}.`;
        }
        return resultOption;
    };

    const handleCompleteTicket = async (id, result) => {
        if (!result) {
            toast.error('Vui lòng chọn kết quả xử lý.');
            return;
        }
        setStatusLoading(true);
        try {
            const ticket = tickets.find(t => t.id === id);
            if (!ticket) throw new Error('Không tìm thấy thông tin ticket.');
            
            const detailedResult = generateDetailedResult(ticket, result);
            
            const res = await fetch(`${API_BASE}/tickets/${id}/complete`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify(detailedResult),
            });
            if (!res.ok) throw new Error('Không thể hoàn thành ticket.');
            const updated = await res.json();
            setTickets((prev) => prev.map(t => (t.id === id ? updated : t)));
            toast.success('Đã hoàn thành và lưu kết quả!');
            setResultOption('');
            fetchTickets(activeTab);
        } catch (err) {
            toast.error(err.message || 'Lỗi khi hoàn thành ticket.');
        } finally {
            setStatusLoading(false);
        }
    };
    
    const filteredTickets = tickets.filter(ticket => {
        if (!search.trim()) return true;
        const idMatch = ticket.id?.toString().includes(search.trim());
        const name = ticket.customer?.fullName || ticket.customer?.name || '';
        const nameMatch = name.toLowerCase().includes(search.trim().toLowerCase());
        return idMatch || nameMatch;
    });

    const methodMap = { SELF_TEST: 'Tự gửi mẫu', AT_FACILITY: 'Tại cơ sở y tế' };

    const generatePDFReport = async (ticket) => {
        try {
            const type = ticket.type;
            const method = methodMap[ticket.method] || ticket.method;
            const customerName = ticket.customer?.fullName || ticket.customer?.name;
            const phone = ticket.customer?.phone;
            const email = ticket.customer?.email;
            const result = getDisplayResult(ticket.resultString);
            const reason = ticket.reason || 'N/A';
            const sample1Name = ticket.sample1Name || 'Mẫu 1';
            const sample2Name = ticket.sample2Name || 'Mẫu 2';
            const address = ticket.address || 'N/A';
            const appointmentDate = ticket.appointmentDate ? new Date(ticket.appointmentDate).toLocaleDateString('vi-VN') : 'N/A';
            const customerCode = `KH${ticket.id.toString().padStart(6, '0')}`;
            
            const resultLower = result ? result.toLowerCase() : '';
            const isMatch = resultLower && (
                resultLower.includes('trùng khớp') || 
                resultLower.includes('có quan hệ huyết thống') ||
                (resultLower.includes('xác suất') && resultLower.includes('99.99')) ||
                resultLower.includes('99.99%') ||
                resultLower.includes('99.999%')
            );
            const conclusionText = isMatch ? 'TRÙNG KHỚP' : 'KHÔNG TRÙNG KHỚP';
            const conclusionColor = isMatch ? '#28a745' : '#dc3545';

            const docDefinition = {
                pageSize: 'A4',
                pageMargins: [50, 80, 50, 80],
                content: [
                    {
                        columns: [
                            { width: 80, text: '🧬', style: 'logoText', alignment: 'center' },
                            {
                                width: '*',
                                text: [
                                    { text: 'TRUNG TÂM XÉT NGHIỆM ADN', style: 'mainHeader', alignment: 'center' },
                                    { text: 'PHIẾU TRẢ KẾT QUẢ XÉT NGHIỆM ADN', style: 'subHeader', alignment: 'center', margin: [0, 5, 0, 0] }
                                ],
                                margin: [20, 0, 0, 0]
                            }
                        ],
                        margin: [0, 0, 0, 30]
                    },
                    {
                        text: [
                            'Địa chỉ: 123 Đường ABC, Quận XYZ, TP.HCM\n',
                            'Số điện thoại: 028-1234-5678 | Email: info@adnlab.com\n',
                            'Website: www.adnlab.com | Giấy phép: 123456789'
                        ],
                        style: 'centerInfo',
                        alignment: 'center',
                        margin: [0, 0, 0, 25]
                    },
                    {
                        columns: [
                            {
                                width: '*',
                                text: [
                                    { text: 'THÔNG TIN PHIẾU', style: 'sectionHeader' },
                                    {
                                        text: [
                                            `Mã phiếu: ${ticket.id}\n`,
                                            `Mã khách hàng: ${customerCode}\n`,
                                            `Ngày gửi mẫu: ${ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString('vi-VN') : 'N/A'}\n`,
                                            `Ngày trả kết quả: ${new Date().toLocaleDateString('vi-VN')}`
                                        ],
                                        style: 'infoText'
                                    }
                                ]
                            },
                            {
                                width: '*',
                                text: [
                                    { text: 'THÔNG TIN KHÁCH HÀNG', style: 'sectionHeader' },
                                    {
                                        text: [
                                            `Họ và tên: ${customerName || 'N/A'}\n`,
                                            `Số điện thoại: ${phone || 'N/A'}\n`,
                                            `Email: ${email || 'N/A'}`
                                        ],
                                        style: 'infoText'
                                    }
                                ],
                                margin: [20, 0, 0, 0]
                            }
                        ],
                        margin: [0, 0, 0, 25]
                    },
                    { text: 'THÔNG TIN XÉT NGHIỆM', style: 'sectionHeader', margin: [0, 0, 0, 10] },
                    {
                        text: [
                            `Loại xét nghiệm: ${type || 'N/A'}\n`,
                            `Lý do xét nghiệm: ${reason}\n`,
                            `Phương thức nhận mẫu: ${method}\n`,
                            `Tên mẫu 1: ${sample1Name}\n`,
                            `Tên mẫu 2: ${sample2Name}`
                        ],
                        style: 'infoText',
                        margin: [0, 0, 0, 15]
                    },
                    {
                        text: [
                            method === 'Tại cơ sở y tế' ? `Ngày hẹn: ${appointmentDate}\n` : '',
                            method === 'Tự gửi mẫu' ? `Địa chỉ gửi mẫu: ${address}\n` : ''
                        ].filter(Boolean).join(''),
                        style: 'infoText',
                        margin: [0, 0, 0, 25]
                    },
                    {
                        text: 'KẾT QUẢ XÉT NGHIỆM',
                        style: 'sectionHeader',
                        margin: [0, 0, 0, 15]
                    },
                    {
                        style: 'resultText',
                        margin: [0, 0, 0, 30],
                        text: [
                            { text: 'Kết quả: ', bold: true },
                            { text: conclusionText, color: conclusionColor, bold: true },
                            { text: `\n${result}` }
                        ]
                    },
                    {
                        text: 'CHỮ KÝ XÁC NHẬN',
                        style: 'sectionHeader',
                        margin: [0, 0, 0, 15]
                    },
                    {
                        columns: [
                            {
                                width: '*',
                                text: ['Người thực hiện xét nghiệm:\n','_________________\n','(Ký và ghi rõ họ tên)'],
                                style: 'signatureText',
                                alignment: 'center'
                            },
                            {
                                width: '*',
                                text: ['Người duyệt kết quả:\n','_________________\n','(Ký và ghi rõ họ tên)'],
                                style: 'signatureText',
                                alignment: 'center'
                            },
                            { width: 100, text: 'ĐÓNG DẤU\nTRUNG TÂM', style: 'stampText', alignment: 'center', background: '#f8f9fa' }
                        ],
                        margin: [0, 0, 0, 30]
                    },
                    { text: 'GHI CHÚ QUAN TRỌNG', style: 'sectionHeader', margin: [0, 0, 0, 10] },
                    {
                        text: [
                            '• Văn bản này chỉ có hiệu lực khi có dấu xác nhận của trung tâm\n',
                            '• Kết quả xét nghiệm có hiệu lực trong vòng 30 ngày kể từ ngày trả kết quả\n',
                            '• Mọi thắc mắc vui lòng liên hệ trung tâm qua số điện thoại hoặc email trên\n',
                            '• Trung tâm không chịu trách nhiệm về việc sử dụng kết quả cho mục đích khác'
                        ],
                        style: 'noteText',
                        margin: [0, 0, 0, 20]
                    }
                ],
                styles: {
                    mainHeader: { fontSize: 20, bold: true, color: '#1a237e', alignment: 'center' },
                    subHeader: { fontSize: 16, bold: true, color: '#333333', alignment: 'center' },
                    logoText: { fontSize: 40, alignment: 'center' },
                    centerInfo: { fontSize: 10, color: '#666666', lineHeight: 1.4 },
                    sectionHeader: { fontSize: 14, bold: true, color: '#424242', margin: [0, 0, 0, 8] },
                    infoText: { fontSize: 11, lineHeight: 1.5, color: '#333333' },
                    resultText: { fontSize: 11, lineHeight: 1.6, background: '#f5f5f5', padding: 15, color: '#333333' },
                    conclusionIcon: { fontSize: 24, bold: true },
                    conclusionText: { fontSize: 16, bold: true },
                    signatureText: { fontSize: 11, lineHeight: 1.5, color: '#333333' },
                    stampText: { fontSize: 10, bold: true, color: '#666666', padding: 10 },
                    noteText: { fontSize: 10, lineHeight: 1.4, color: '#666666' }
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
        <StaffLayout>
            <div className="staff-page">
                <h2 className="staff-title-modern">Quản lý Yêu Cầu (Staff)</h2>
                <div className="modern-tabs-row">
                    {tabOptions.map(tab => (
                        <button
                            key={tab.key}
                            className={`modern-tab-btn${activeTab === tab.key ? ' active' : ''}`}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            {tab.label}
                        </button>
                    ))}
                    <input
                        type="text"
                        className="modern-search-input"
                        placeholder="Tìm theo ID hoặc tên khách hàng..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                {loading ? (
                    <div className="staff-spinner"><div className="spinner"></div></div>
                ) : error ? (
                    <p style={{ color: 'red' }}>{error}</p>
                ) : (
                    <div className="ticket-list-modern fade-in">
                        <h3 className="ticket-list-title-modern">Danh sách Ticket được giao</h3>
                        <ul className="ticket-ul-modern">
                            {filteredTickets.length === 0 && <li className="ticket-empty-modern">Không có yêu cầu nào phù hợp.</li>}
                            {filteredTickets.map((ticket) => (
                                <React.Fragment key={ticket.id}>
                                    <li
                                        className={`ticket-item-modern${selectedTicketId === ticket.id ? ' selected' : ''}`}
                                        onClick={() => setSelectedTicketId(selectedTicketId === ticket.id ? null : ticket.id)}
                                    >
                                        <span className="ticket-id-modern">#{ticket.id}</span>
                                        <span className="ticket-type-modern">{ticket.type}</span>
                                        <span className={`ticket-status-badge-list status-${ticket.status.toLowerCase()}`}>{(() => {
                                            switch(ticket.status) {
                                                case 'PENDING': return 'Chờ xử lý';
                                                case 'IN_PROGRESS': return 'Đang xử lý';
                                                case 'COMPLETED': return 'Đã hoàn thành';
                                                default: return ticket.status;
                                            }
                                        })()}</span>
                                        <span className="ticket-customer-modern">{ticket.customer?.fullName || ticket.customer?.name || ''}</span>
                                    </li>
                                    {selectedTicketId === ticket.id && (
                                        <li>
                                            <div className="ticket-detail modern-card fade-in" style={{marginTop: 8, marginBottom: 8}}>
                                                <h3 className="ticket-detail-title">Chi tiết Ticket #{ticket.id}</h3>
                                                <div className="ticket-status-row">
                                                    <span className={`ticket-status-badge status-${ticket.status.toLowerCase()}`}>{(() => {
                                                        switch(ticket.status) {
                                                            case 'PENDING': return 'Chờ xử lý';
                                                            case 'IN_PROGRESS': return 'Đang xử lý';
                                                            case 'COMPLETED': return 'Đã hoàn thành';
                                                            default: return ticket.status;
                                                        }
                                                    })()}</span>
                                                </div>
                                                <div className="ticket-info-grid">
                                                    <div><strong>Khách hàng:</strong> <span>{ticket.customer?.fullName || ticket.customer?.name || ''}</span></div>
                                                    <div><strong>Email:</strong> <span>{ticket.customer?.email || ''}</span></div>
                                                    <div><strong>SĐT:</strong> <span>{ticket.customer?.phone || ''}</span></div>
                                                    <div><strong>Phương thức:</strong> <span>{methodMap[ticket.method] || ticket.method}</span></div>
                                                    <div><strong>Lý do:</strong> <span>{ticket.reason || ''}</span></div>
                                                    <div><strong>Thời gian tạo:</strong> <span>{ticket.createdAt ? new Date(ticket.createdAt).toLocaleString('vi-VN') : 'Không có thông tin'}</span></div>
                                                    {ticket.appointmentDate &&
                                                        <div><strong>Ngày hẹn:</strong> <span>{new Date(ticket.appointmentDate).toLocaleDateString('vi-VN')}</span></div>
                                                    }
                                                    {ticket.address &&
                                                        <div><strong>Địa chỉ gửi mẫu:</strong> <span>{ticket.address}</span></div>
                                                    }
                                                    <div><strong>Tên Mẫu 1:</strong> <span>{ticket.sample1Name || ''}</span></div>
                                                    <div><strong>Tên Mẫu 2:</strong> <span>{ticket.sample2Name || ''}</span></div>
                                                </div>
                                                {ticket.status === 'PENDING' && ticket.staff == null && (
                                                    <div style={{ margin: '24px 0 0 0', textAlign: 'center' }}>
                                                        <button
                                                            className="btn-processing modern-btn"
                                                            onClick={e => { e.stopPropagation(); handleAssignSelf(ticket.id); }}
                                                            disabled={statusLoading}
                                                        >
                                                            Nhận xử lý
                                                        </button>
                                                    </div>
                                                )}
                                                {ticket.status === 'IN_PROGRESS' && (
                                                    <div style={{ margin: '24px 0 0 0', textAlign: 'center' }}>
                                                        <label style={{ marginRight: 10, fontWeight: 600, fontSize: 16 }}>Kết quả xử lý:</label>
                                                        <select
                                                            value={resultOption}
                                                            onChange={e => setResultOption(e.target.value)}
                                                            className="modern-select"
                                                        >
                                                            <option value="">-- Chọn kết quả --</option>
                                                            <option value="Thông tin trùng khớp">Thông tin trùng khớp</option>
                                                            <option value="Thông tin không trùng khớp">Thông tin không trùng khớp</option>
                                                        </select>
                                                        {resultOption && (
                                                            <>
                                                                <p style={{ marginTop: 12, fontStyle: 'italic', color: '#1976d2', fontSize: 15 }}>
                                                                    Kết luận: {resultOption}.
                                                                </p>
                                                                <button
                                                                    className="btn-complete modern-btn"
                                                                    style={{ marginTop: 16 }}
                                                                    onClick={e => { e.stopPropagation(); handleCompleteTicket(ticket.id, resultOption); }}
                                                                    disabled={statusLoading || !resultOption}
                                                                >
                                                                    Xác nhận Hoàn thành
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                                {ticket.status === 'COMPLETED' && (
                                                    <div className="result-display-box">
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                                            <h4>Kết quả xử lý</h4>
                                                            <button
                                                                onClick={() => generatePDFReport(ticket)}
                                                                className="pdf-download-btn"
                                                            >
                                                                📄 Tải PDF
                                                            </button>
                                                        </div>
                                                        <div className="detailed-result" style={{ whiteSpace: 'pre-wrap' }}>
                                                            {getDisplayResult(ticket.resultString)}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </li>
                                    )}
                                </React.Fragment>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </StaffLayout>
    );
};

export default StaffPage;

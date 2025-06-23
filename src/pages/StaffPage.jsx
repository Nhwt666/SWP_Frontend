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
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [statusLoading, setStatusLoading] = useState(false);
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [resultOption, setResultOption] = useState('');

    const [activeTab, setActiveTab] = useState('unassigned');
    const [isModalOpen, setIsModalOpen] = useState(false);

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
        if (!isModalOpen) {
            fetchTickets(activeTab);
        }
    }, [activeTab, fetchTickets, isModalOpen]);

    const handleOpenModal = (ticket) => {
        setSelectedTicket(ticket);
        setIsModalOpen(true);
        setResultOption('');
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedTicket(null);
    };

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
            handleCloseModal();
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

    const ResultDisplay = ({ resultString }) => {
        if (!resultString) {
            return (
                <div className="result-display-box">
                    <div className="result-header">
                        <h4>Kết quả xét nghiệm</h4>
                    </div>
                    <div className="result-content">
                        <p className="no-result">Chưa có thông tin kết quả.</p>
                    </div>
                </div>
            );
        }

        const result = getDisplayResult(resultString);
        const lines = result.split('\n');
        
        // Phân tích kết quả để xác định loại
        const isPositive = result.includes('Có quan hệ huyết thống') || result.includes('trùng khớp');
        const isNegative = result.includes('Không có quan hệ huyết thống') || result.includes('không trùng khớp');
        
        // Trích xuất thông tin
        const conclusion = lines[0] || '';
        const probability = lines.find(line => line.includes('Tỉ lệ xác suất:')) || '';
        const purpose = lines.find(line => line.includes('Lý do xét nghiệm:')) || '';

        return (
            <div className="result-display-box">
                <div className="result-header">
                    <h4>Kết quả xét nghiệm</h4>
                    <div className={`result-status ${isPositive ? 'positive' : isNegative ? 'negative' : 'neutral'}`}>
                        {isPositive ? '✅ Trùng khớp' : isNegative ? '❌ Không trùng khớp' : '📋 Kết quả'}
                    </div>
                </div>
                
                <div className="result-content">
                    <div className="result-card conclusion">
                        <div className="result-card-header">
                            <span className="result-icon">🎯</span>
                            <span className="result-label">Kết luận</span>
                        </div>
                        <div className="result-value">
                            {conclusion.replace(/^[✔️✖️]\s*/, '')}
                        </div>
                    </div>
                    
                    {probability && (
                        <div className="result-card probability">
                            <div className="result-card-header">
                                <span className="result-icon">📊</span>
                                <span className="result-label">Tỉ lệ xác suất</span>
                            </div>
                            <div className="result-value">
                                {probability.replace('Tỉ lệ xác suất:', '').trim()}
                            </div>
                        </div>
                    )}
                    
                    {purpose && (
                        <div className="result-card purpose">
                            <div className="result-card-header">
                                <span className="result-icon">📋</span>
                                <span className="result-label">Mục đích xét nghiệm</span>
                            </div>
                            <div className="result-value">
                                {purpose.replace('Lý do xét nghiệm:', '').trim()}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
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
            handleCloseModal();
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

    // Mappings for request type display and service names
    const typeDisplayMap = {
        'CIVIL': 'Dân sự',
        'ADMINISTRATIVE': 'Hành chính',
        'OTHER': 'Khác'
    };
    const typeServiceMap = {
        'CIVIL': 'Xác minh quyền thừa kế',
        'ADMINISTRATIVE': 'Xác minh danh tính',
        'OTHER': 'Yêu cầu khác',
    };

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
                            'Số Hotline: 1800.9999\n',
                            'Email: trungtamxetnghiem@gmail.com\n',
                            'Địa chỉ: 643 Điện Biên Phủ, Phường 1, Quận 3, TPHCM'
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
                                            { text: `Họ và tên: ${customerName || 'N/A'}\n`, style: 'infoText' },
                                            { text: `Số điện thoại: ${phone || 'N/A'}\n`, style: 'infoText' },
                                            { text: `Email: ${email || 'N/A'}`, style: 'infoText' }
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
                                            { text: `Loại xét nghiệm: ${typeServiceMap[type] || typeDisplayMap[type] || type}\n`, style: 'infoText' },
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
                        <table className="modern-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Khách hàng</th>
                                    <th>Loại yêu cầu</th>
                                    <th>Trạng thái</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTickets.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="ticket-empty-modern">Không có yêu cầu nào phù hợp.</td>
                                    </tr>
                                ) : (
                                    filteredTickets.map((ticket) => (
                                        <tr key={ticket.id}>
                                            <td>#{ticket.id}</td>
                                            <td>{ticket.customer?.fullName || ticket.customer?.name || 'N/A'}</td>
                                            <td>{typeServiceMap[ticket.type] || typeDisplayMap[ticket.type] || ticket.type}</td>
                                            <td>
                                                <span className={`ticket-status-badge-list status-${ticket.status.toLowerCase()}`}>
                                                    {(() => {
                                                        switch(ticket.status) {
                                                            case 'PENDING': return 'Chờ xử lý';
                                                            case 'IN_PROGRESS': return 'Đang xử lý';
                                                            case 'COMPLETED': return 'Đã hoàn thành';
                                                            default: return ticket.status;
                                                        }
                                                    })()}
                                                </span>
                                            </td>
                                            <td>
                                                <button className="btn-details" onClick={() => handleOpenModal(ticket)}>
                                                    {activeTab === 'completed' ? 'Xem chi tiết' : 'Xử lý'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
                
                {isModalOpen && selectedTicket && (
                    <div className="modal-overlay" onClick={handleCloseModal}>
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            <button className="modal-close-btn" onClick={handleCloseModal}>&times;</button>
                            <div className="ticket-detail modern-card">
                                <h3 className="ticket-detail-title">Chi tiết Ticket #{selectedTicket.id}</h3>
                                <div className="ticket-status-row">
                                    <span className={`ticket-status-badge status-${selectedTicket.status.toLowerCase()}`}>
                                        {(() => {
                                            switch(selectedTicket.status) {
                                                case 'PENDING': return 'Chờ xử lý';
                                                case 'IN_PROGRESS': return 'Đang xử lý';
                                                case 'COMPLETED': return 'Đã hoàn thành';
                                                default: return selectedTicket.status;
                                            }
                                        })()}
                                    </span>
                                </div>
                                <div className="ticket-info-grid">
                                    <div><strong>Khách hàng:</strong> <span>{selectedTicket.customer?.fullName || selectedTicket.customer?.name || ''}</span></div>
                                    <div><strong>Email:</strong> <span>{selectedTicket.customer?.email || ''}</span></div>
                                    <div><strong>SĐT:</strong> <span>{selectedTicket.customer?.phone || ''}</span></div>
                                    <div><strong>Phương thức:</strong> <span>{methodMap[selectedTicket.method] || selectedTicket.method}</span></div>
                                    <div><strong>Lý do:</strong> <span>{selectedTicket.reason || ''}</span></div>
                                    <div><strong>Thời gian tạo:</strong> <span>{selectedTicket.createdAt ? new Date(selectedTicket.createdAt).toLocaleString('vi-VN') : 'Không có thông tin'}</span></div>
                                    {selectedTicket.appointmentDate &&
                                        <div><strong>Ngày hẹn:</strong> <span>{new Date(selectedTicket.appointmentDate).toLocaleDateString('vi-VN')}</span></div>
                                    }
                                    {selectedTicket.address &&
                                        <div><strong>Địa chỉ gửi mẫu:</strong> <span>{selectedTicket.address}</span></div>
                                    }
                                    <div><strong>Tên Mẫu 1:</strong> <span>{selectedTicket.sample1Name || ''}</span></div>
                                    <div><strong>Tên Mẫu 2:</strong> <span>{selectedTicket.sample2Name || ''}</span></div>
                                </div>

                                {selectedTicket.status === 'PENDING' && selectedTicket.staff == null && (
                                    <div style={{ margin: '24px 0 0 0', textAlign: 'center' }}>
                                        <button
                                            className="btn-processing modern-btn"
                                            onClick={() => handleAssignSelf(selectedTicket.id)}
                                            disabled={statusLoading}
                                        >
                                            Nhận xử lý
                                        </button>
                                    </div>
                                )}
                                {selectedTicket.status === 'IN_PROGRESS' && (
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
                                                    onClick={() => handleCompleteTicket(selectedTicket.id, resultOption)}
                                                    disabled={statusLoading || !resultOption}
                                                >
                                                    Xác nhận Hoàn thành
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}
                                {selectedTicket.status === 'COMPLETED' && (
                                    <div className="result-display-box">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                            <h4>Kết quả xử lý</h4>
                                            <button
                                                onClick={() => generatePDFReport(selectedTicket)}
                                                className="pdf-download-btn"
                                            >
                                                📄 Tải PDF
                                            </button>
                                        </div>
                                        <ResultDisplay resultString={selectedTicket.resultString} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </StaffLayout>
    );
};

export default StaffPage;

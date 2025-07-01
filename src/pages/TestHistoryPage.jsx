import React, { useEffect, useState } from 'react';
import { vfs } from '../fonts/RobotoVFS.js';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { toast } from 'react-toastify';
import '../styles/TestHistoryPage.css';
import Header from '../components/Header';
import NotificationService from '../services/NotificationService';

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
    RECEIVED: 'Đã nhận kit',
    CONFIRMED: 'Đã xác nhận Yêu Cầu',
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
    const [diagnosticResults, setDiagnosticResults] = useState('');
    const [currentUserId, setCurrentUserId] = useState(null);

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

    useEffect(() => {
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
        
        // Get current user info
        const getCurrentUser = async () => {
            try {
                const res = await fetch('/auth/me', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                if (res.ok) {
                    const user = await res.json();
                    setCurrentUserId(user.id);
                }
            } catch (error) {
                console.error("Failed to get current user", error);
            }
        };
        
        fetchHistory();
        fetchStaff();
        getCurrentUser();
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

    // Helper to check if feedback exists
    const hasFeedback = (ticket) => {
        console.log('Checking feedback for ticket:', ticket.id, 'Feedback data:', ticket.feedback);
        
        // Check various possible feedback properties
        if (ticket.feedback && typeof ticket.feedback === 'object') {
            return ticket.feedback.rating != null || ticket.feedback.feedback != null;
        }
        
        // Check if feedback is a string
        if (typeof ticket.feedback === 'string' && ticket.feedback.trim() !== '') {
            return true;
        }
        
        // Check other possible feedback properties
        if (ticket.rating != null || ticket.review != null) {
            return true;
        }
        
        return false;
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

    // Test API connection
    const testAPIConnection = async () => {
        try {
            const testRes = await fetch('/tickets/history', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            console.log('API test response:', testRes.status);
            return testRes.ok;
        } catch (err) {
            console.error('API test failed:', err);
            return false;
        }
    };

    // Check backend information
    const checkBackendInfo = async () => {
        console.log('=== BACKEND DIAGNOSTIC ===');
        let results = [];
        
        // 1. Check if server is running
        try {
            const healthCheck = await fetch('/actuator/health', { method: 'GET' });
            console.log('Health check status:', healthCheck.status);
            results.push(`Health check: ${healthCheck.status} ${healthCheck.statusText}`);
        } catch (err) {
            console.log('Health check failed:', err.message);
            results.push(`Health check: ERROR - ${err.message}`);
        }

        // 2. Check authentication
        const token = localStorage.getItem('token');
        console.log('Token exists:', !!token);
        results.push(`Token exists: ${!!token}`);
        if (token) {
            console.log('Token length:', token.length);
            console.log('Token starts with:', token.substring(0, 20) + '...');
            results.push(`Token length: ${token.length}`);
        }

        // 3. Check available endpoints
        const endpointsToTest = [
            '/tickets/history',
            '/tickets',
            '/api/tickets',
            '/customer/tickets'
        ];

        for (const endpoint of endpointsToTest) {
            try {
                const res = await fetch(endpoint, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                console.log(`${endpoint}: ${res.status} ${res.statusText}`);
                results.push(`${endpoint}: ${res.status} ${res.statusText}`);
            } catch (err) {
                console.log(`${endpoint}: ERROR - ${err.message}`);
                results.push(`${endpoint}: ERROR - ${err.message}`);
            }
        }

        // 4. Check feedback endpoint specifically
        if (selectedTicket) {
            const feedbackEndpoints = [
                `/customer/tickets/${selectedTicket.id}/feedback`,
                `/tickets/${selectedTicket.id}/feedback`,
                `/api/tickets/${selectedTicket.id}/feedback`
            ];
            
            for (const feedbackEndpoint of feedbackEndpoints) {
                try {
                    const res = await fetch(feedbackEndpoint, {
                        method: 'OPTIONS',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    console.log(`Feedback endpoint ${feedbackEndpoint} OPTIONS: ${res.status} ${res.statusText}`);
                    console.log('Allowed methods:', res.headers.get('allow'));
                    results.push(`${feedbackEndpoint} OPTIONS: ${res.status} ${res.statusText}`);
                    results.push(`Allowed methods: ${res.headers.get('allow') || 'None'}`);
                    
                    // Also try GET to see if endpoint exists
                    try {
                        const getRes = await fetch(feedbackEndpoint, {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });
                        console.log(`Feedback endpoint ${feedbackEndpoint} GET: ${getRes.status} ${getRes.statusText}`);
                        results.push(`${feedbackEndpoint} GET: ${getRes.status} ${getRes.statusText}`);
                    } catch (getErr) {
                        console.log(`Feedback endpoint ${feedbackEndpoint} GET: ERROR - ${getErr.message}`);
                        results.push(`${feedbackEndpoint} GET: ERROR - ${getErr.message}`);
                    }
                } catch (err) {
                    console.log(`Feedback endpoint ${feedbackEndpoint} OPTIONS: ERROR - ${err.message}`);
                    results.push(`${feedbackEndpoint} OPTIONS: ERROR - ${err.message}`);
                }
            }
        }

        console.log('=== END DIAGNOSTIC ===');
        setDiagnosticResults(results.join('\n'));
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
            console.log('Đang gửi feedback:', {
                ticketId: selectedTicket.id,
                rating: feedbackRating,
                feedback: feedbackComment
            });

            // Thêm timeout để tránh chờ quá lâu
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 giây timeout

            // Sử dụng endpoint đã được backend implement
            const res = await fetch(`/customer/tickets/${selectedTicket.id}/feedback`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ 
                    rating: feedbackRating, 
                    feedback: feedbackComment 
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            console.log('Response status:', res.status);

            if (!res.ok) {
                let errorData;
                try {
                    const responseText = await res.text();
                    console.log('Error response text:', responseText);
                    
                    // Try to parse as JSON
                    try {
                        errorData = JSON.parse(responseText);
                        console.log('Error response JSON:', errorData);
                    } catch (parseError) {
                        errorData = responseText;
                    }
                } catch (readError) {
                    console.log('Could not read response body:', readError);
                    errorData = `HTTP ${res.status}: ${res.statusText}`;
                }
                
                const errorMessage = errorData?.message || errorData || `HTTP ${res.status}: ${res.statusText}`;
                
                // Xử lý lỗi cụ thể dựa trên status code
                if (res.status === 403) {
                    setFeedbackError(`Lỗi quyền truy cập: ${errorMessage}`);
                } else if (res.status === 401) {
                    setFeedbackError('Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.');
                } else if (res.status === 404) {
                    setFeedbackError('Ticket không tồn tại.');
                } else if (res.status === 400) {
                    if (errorMessage.includes('timestamp') || errorMessage.includes('JDBC') || errorMessage.includes('ResultSet')) {
                        setFeedbackError('Lỗi cấu hình database. Vui lòng liên hệ admin để kiểm tra cấu hình backend.');
                    } else {
                        setFeedbackError(`Dữ liệu không hợp lệ: ${errorMessage}`);
                    }
                } else if (res.status === 500) {
                    setFeedbackError('Lỗi server. Vui lòng thử lại sau hoặc liên hệ admin.');
                } else {
                    setFeedbackError(`Gửi phản hồi thất bại: ${errorMessage}`);
                }
            } else {
                let successData;
                try {
                    const responseText = await res.text();
                    console.log('Success response text:', responseText);
                    
                    // Try to parse as JSON
                    try {
                        successData = JSON.parse(responseText);
                        console.log('Success response JSON:', successData);
                    } catch (parseError) {
                        successData = responseText;
                    }
                } catch (readError) {
                    console.log('Could not read success response body:', readError);
                    successData = 'Success';
                }

                setFeedbackSuccess('Gửi phản hồi thành công! Cảm ơn bạn đã đánh giá dịch vụ của chúng tôi.');
                
                // Update ticket in history to reflect feedback
                setHistory(prev => prev.map(t => 
                    t.id === selectedTicket.id 
                        ? { 
                            ...t, 
                            feedback: { 
                                rating: feedbackRating, 
                                feedback: feedbackComment,
                                feedbackDate: new Date().toISOString()
                            } 
                        } 
                        : t
                ));
                
                setTimeout(() => {
                    setShowFeedbackModal(false);
                }, 2000);
            }
        } catch (err) {
            console.error('Network error khi gửi phản hồi:', err);
            
            if (err.name === 'AbortError') {
                setFeedbackError('Yêu cầu bị timeout. Vui lòng thử lại.');
            } else if (err.message.includes('Failed to fetch')) {
                setFeedbackError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra internet và thử lại.');
            } else if (err.message.includes('CORS')) {
                setFeedbackError('Lỗi CORS. Backend chưa được cấu hình đúng để cho phép frontend truy cập.');
            } else if (err.message.includes('body stream already read')) {
                setFeedbackError('Lỗi xử lý response. Vui lòng thử lại.');
            } else {
                setFeedbackError(`Lỗi kết nối: ${err.message}`);
            }
        } finally {
            setFeedbackLoading(false);
        }
    };

    return (
        <>
            <style>
                {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}
            </style>
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
                            
                            {/* Kit confirmation buttons for CIVIL SELF_TEST tickets */}
                            {selectedTicket.type === 'CIVIL' && selectedTicket.method === 'SELF_TEST' && (
                                <div style={{ marginTop: '20px', padding: '16px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
                                    <h4 style={{ margin: '0 0 12px 0', color: '#495057', fontSize: '1rem' }}>📦 Quản lý Kit xét nghiệm</h4>
                                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                        {selectedTicket.status === 'CONFIRMED' && (
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        const oldStatus = selectedTicket.status;
                                                        const res = await fetch(`/customer/tickets/${selectedTicket.id}/confirm-received`, {
                                                            method: 'PUT',
                                                            headers: {
                                                                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                                                                'Content-Type': 'application/json'
                                                            }
                                                        });
                                                        if (res.ok) {
                                                            // Tạo notification cho thay đổi trạng thái
                                                            try {
                                                                await NotificationService.createStatusChangeNotification(
                                                                    selectedTicket.id,
                                                                    oldStatus,
                                                                    'RECEIVED',
                                                                    selectedTicket.customer?.fullName || selectedTicket.customer?.name || 'Khách hàng'
                                                                );
                                                            } catch (notiError) {
                                                                console.error('Lỗi tạo notification:', notiError);
                                                            }
                                                            
                                                            alert('✅ Đã xác nhận nhận kit thành công!');
                                                            setShowModal(false);
                                                            fetchHistory();
                                                        } else {
                                                            const error = await res.json();
                                                            alert(`❌ Lỗi: ${error.message || 'Không thể xác nhận nhận kit'}`);
                                                        }
                                                    } catch (err) {
                                                        alert('❌ Lỗi kết nối: ' + err.message);
                                                    }
                                                }}
                                                style={{
                                                    padding: '8px 16px',
                                                    background: '#2e7d32',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.9rem',
                                                    fontWeight: '600'
                                                }}
                                            >
                                                ✅ Xác nhận đã nhận kit
                                            </button>
                                        )}
                                        {selectedTicket.status === 'RECEIVED' && (
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        const oldStatus = selectedTicket.status;
                                                        const res = await fetch(`/customer/tickets/${selectedTicket.id}/confirm-sent`, {
                                                            method: 'PUT',
                                                            headers: {
                                                                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                                                                'Content-Type': 'application/json'
                                                            }
                                                        });
                                                        if (res.ok) {
                                                            // Tạo notification cho thay đổi trạng thái
                                                            try {
                                                                await NotificationService.createStatusChangeNotification(
                                                                    selectedTicket.id,
                                                                    oldStatus,
                                                                    'PENDING',
                                                                    selectedTicket.customer?.fullName || selectedTicket.customer?.name || 'Khách hàng'
                                                                );
                                                            } catch (notiError) {
                                                                console.error('Lỗi tạo notification:', notiError);
                                                            }
                                                            
                                                            alert('✅ Đã xác nhận gửi kit thành công!');
                                                            setShowModal(false);
                                                            fetchHistory();
                                                        } else {
                                                            const error = await res.json();
                                                            alert(`❌ Lỗi: ${error.message || 'Không thể xác nhận gửi kit'}`);
                                                        }
                                                    } catch (err) {
                                                        alert('❌ Lỗi kết nối: ' + err.message);
                                                    }
                                                }}
                                                style={{
                                                    padding: '8px 16px',
                                                    background: '#f57c00',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.9rem',
                                                    fontWeight: '600'
                                                }}
                                            >
                                                📤 Xác nhận đã gửi kit
                                            </button>
                                        )}
                                        {(selectedTicket.status === 'CONFIRMED' || selectedTicket.status === 'RECEIVED' || selectedTicket.status === 'PENDING') && (
                                            <div style={{ fontSize: '0.85rem', color: '#6c757d', fontStyle: 'italic' }}>
                                                {selectedTicket.status === 'CONFIRMED' 
                                                    ? '💡 Kit đã được gửi đến bạn. Hãy xác nhận khi nhận được kit.'
                                                    : selectedTicket.status === 'RECEIVED'
                                                    ? '💡 Bạn đã nhận kit. Sau khi thu thập mẫu, hãy gửi kit về trung tâm.'
                                                    : '💡 Kit đã được gửi về trung tâm. Chúng tôi sẽ xử lý và trả kết quả sớm nhất.'
                                                }
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            
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
                                            transition: 'background 0.2s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 6,
                                            boxShadow: '0 2px 8px rgba(255, 152, 0, 0.3)'
                                        }}
                                        onMouseOver={e => e.currentTarget.style.background = '#f57c00'}
                                        onMouseOut={e => e.currentTarget.style.background = '#ff9800'}
                                    >
                                        ⭐ Gửi đánh giá
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
                        background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
                    }}>
                        <div style={{ 
                            background: '#fff', 
                            borderRadius: 12, 
                            padding: 32, 
                            minWidth: 400, 
                            maxWidth: 500, 
                            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                            maxHeight: '90vh',
                            overflowY: 'auto'
                        }}>
                            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                                <h3 style={{ color: '#233a7d', margin: '0 0 8px 0', fontSize: '1.5rem' }}>
                                    ⭐ Đánh giá dịch vụ
                                </h3>
                                <p style={{ color: '#666', margin: 0, fontSize: '0.9rem' }}>
                                    Chia sẻ trải nghiệm của bạn về dịch vụ xét nghiệm ADN
                                </p>
                            </div>
                            
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#333' }}>
                                    Đánh giá: <span style={{ color: '#e74c3c' }}>*</span>
                                </label>
                                <select 
                                    value={feedbackRating} 
                                    onChange={e => setFeedbackRating(Number(e.target.value))} 
                                    style={{ 
                                        fontSize: 16, 
                                        padding: 12, 
                                        borderRadius: 8, 
                                        border: '2px solid #e1e8ed',
                                        width: '100%',
                                        background: '#fff',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {[5,4,3,2,1].map(star => (
                                        <option key={star} value={star}>
                                            {'★'.repeat(star)}{'☆'.repeat(5-star)} ({star} sao)
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div style={{ marginBottom: 24 }}>
                                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#333' }}>
                                    Nhận xét (không bắt buộc):
                                </label>
                                <textarea
                                    value={feedbackComment}
                                    onChange={e => setFeedbackComment(e.target.value)}
                                    rows={4}
                                    style={{ 
                                        width: '100%', 
                                        fontSize: 15, 
                                        padding: 12, 
                                        borderRadius: 8, 
                                        border: '2px solid #e1e8ed',
                                        resize: 'vertical',
                                        fontFamily: 'inherit'
                                    }}
                                    placeholder="Chia sẻ trải nghiệm của bạn về dịch vụ xét nghiệm ADN..."
                                />
                            </div>
                            
                            {feedbackError && (
                                <div style={{ 
                                    background: '#ffebee', 
                                    color: '#c62828', 
                                    padding: 12, 
                                    borderRadius: 8, 
                                    marginBottom: 16,
                                    border: '1px solid #ffcdd2',
                                    fontSize: 14
                                }}>
                                    ❌ {feedbackError}
                                </div>
                            )}
                            
                            {feedbackSuccess && (
                                <div style={{ 
                                    background: '#e8f5e8', 
                                    color: '#2e7d32', 
                                    padding: 12, 
                                    borderRadius: 8, 
                                    marginBottom: 16,
                                    border: '1px solid #c8e6c9',
                                    fontSize: 14
                                }}>
                                    ✅ {feedbackSuccess}
                                </div>
                            )}
                            
                            {/* Debug info */}
                            <div style={{ 
                                background: '#f5f5f5', 
                                padding: 8, 
                                borderRadius: 4, 
                                marginBottom: 16, 
                                fontSize: 12,
                                color: '#666'
                            }}>
                                <strong>Thông tin Ticket:</strong><br/>
                                ID: {selectedTicket.id}<br/>
                                Trạng thái: {selectedTicket.status}<br/>
                                Ngày tạo: {selectedTicket.createdAt ? new Date(selectedTicket.createdAt).toLocaleDateString('vi-VN') : 'N/A'}<br/>
                                Đã có feedback: {hasFeedback(selectedTicket) ? 'Có' : 'Chưa có'}<br/>
                                <br/>
                                <strong>API Endpoint:</strong><br/>
                                PUT /customer/tickets/{selectedTicket.id}/feedback<br/>
                                <br/>
                                <button 
                                    onClick={checkBackendInfo}
                                    style={{ 
                                        padding: '4px 8px', 
                                        background: '#ff9800', 
                                        color: '#fff', 
                                        border: 'none', 
                                        borderRadius: 3, 
                                        cursor: 'pointer',
                                        fontSize: 10
                                    }}
                                >
                                    🔍 Kiểm tra Backend
                                </button>
                                {diagnosticResults && (
                                    <div style={{ 
                                        marginTop: 8, 
                                        padding: 6, 
                                        background: '#fff', 
                                        border: '1px solid #ddd',
                                        borderRadius: 3,
                                        maxHeight: 120,
                                        overflowY: 'auto',
                                        whiteSpace: 'pre-wrap',
                                        fontSize: 10
                                    }}>
                                        <strong>Kết quả kiểm tra:</strong><br/>
                                        {diagnosticResults}
                                    </div>
                                )}
                            </div>
                            
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                                <button
                                    onClick={closeFeedbackModal}
                                    style={{ 
                                        padding: '12px 24px', 
                                        background: '#6c757d', 
                                        color: '#fff', 
                                        border: 'none', 
                                        borderRadius: 8, 
                                        cursor: 'pointer',
                                        fontWeight: 600,
                                        transition: 'background 0.2s'
                                    }}
                                    disabled={feedbackLoading}
                                    onMouseOver={e => !feedbackLoading && (e.currentTarget.style.background = '#5a6268')}
                                    onMouseOut={e => !feedbackLoading && (e.currentTarget.style.background = '#6c757d')}
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleSubmitFeedback}
                                    style={{ 
                                        padding: '12px 24px', 
                                        background: '#1976d2', 
                                        color: '#fff', 
                                        border: 'none', 
                                        borderRadius: 8, 
                                        cursor: 'pointer', 
                                        fontWeight: 600,
                                        transition: 'background 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8
                                    }}
                                    disabled={feedbackLoading}
                                    onMouseOver={e => !feedbackLoading && (e.currentTarget.style.background = '#1565c0')}
                                    onMouseOut={e => !feedbackLoading && (e.currentTarget.style.background = '#1976d2')}
                                >
                                    {feedbackLoading ? (
                                        <>
                                            <div style={{ 
                                                width: 16, 
                                                height: 16, 
                                                border: '2px solid #fff', 
                                                borderTop: '2px solid transparent', 
                                                borderRadius: '50%', 
                                                animation: 'spin 1s linear infinite' 
                                            }}></div>
                                            Đang gửi...
                                        </>
                                    ) : (
                                        <>
                                            📤 Gửi đánh giá
                                        </>
                                    )}
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
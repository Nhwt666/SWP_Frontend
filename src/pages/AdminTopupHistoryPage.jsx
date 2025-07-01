import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminDashboardPage.css';

const AdminTopupHistoryPage = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await fetch('/admin/topup-history', {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (res.ok) {
                    const json = await res.json();
                    setData(json);
                } else {
                    setError('Không thể tải dữ liệu.');
                }
            } catch (err) {
                setError('Lỗi kết nối đến máy chủ.');
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    return (
        <>
            <Header />
            <div className="admin-dashboard-container">
                <main className="dashboard-content" style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-start', minHeight:'80vh'}}>
                    <div style={{width:'100%', maxWidth:900, display:'flex', alignItems:'center', marginBottom:24}}>
                        <button onClick={() => navigate('/admin/dashboard')} style={{marginRight:18, background:'#6c47d8', color:'#fff', border:'none', borderRadius:8, padding:'8px 18px', fontWeight:700, fontSize:16, cursor:'pointer', boxShadow:'0 2px 8px #eee'}}>← Quay lại</button>
                        <h2 style={{color:'#6c47d8', fontWeight:900, fontSize: '2.1rem', margin:0, flex:1, textAlign:'center', letterSpacing:1}}>Lịch sử nạp tiền</h2>
                    </div>
                    {loading ? (
                        <div>Đang tải dữ liệu...</div>
                    ) : error ? (
                        <div style={{color:'red'}}>{error}</div>
                    ) : (
                        <div style={{overflowX:'auto', width:'100%', maxWidth:1100}}>
                            <table style={{width:'100%', background:'#fff', borderRadius:16, boxShadow:'0 4px 18px #eee', fontSize:18, margin:'0 auto'}}>
                                <thead>
                                    <tr style={{background:'#f3e8ff', color:'#6c47d8'}}>
                                        <th style={{padding:'14px 10px'}}>STT</th>
                                        <th style={{padding:'14px 10px'}}>USER</th>
                                        <th style={{padding:'14px 10px'}}>EMAIL</th>
                                        <th style={{padding:'14px 10px'}}>USERNAME</th>
                                        <th style={{padding:'14px 10px'}}>SỐ TIỀN</th>
                                        <th style={{padding:'14px 10px'}}>PHƯƠNG THỨC</th>
                                        <th style={{padding:'14px 10px'}}>MÃ GIAO DỊCH</th>
                                        <th style={{padding:'14px 10px'}}>TRẠNG THÁI</th>
                                        <th style={{padding:'14px 10px'}}>THỜI GIAN</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.length === 0 ? (
                                        <tr><td colSpan={9} style={{textAlign:'center', color:'#888'}}>Không có dữ liệu.</td></tr>
                                    ) : data.map((item, idx) => (
                                        <tr key={item.id || idx}>
                                            <td style={{padding:'12px', textAlign:'center'}}>{idx+1}</td>
                                            <td style={{padding:'12px'}}>{item.userName || 'Ẩn'}</td>
                                            <td style={{padding:'12px'}}>{item.userEmail || 'Ẩn'}</td>
                                            <td style={{padding:'12px'}}>{item.username || item.userName || 'Ẩn'}</td>
                                            <td style={{padding:'12px', color:'#e53e9f', fontWeight:700}}>{Number(item.amount).toLocaleString('vi-VN')}đ</td>
                                            <td style={{padding:'12px', display:'flex', alignItems:'center', gap:8}}>
                                                {item.methodDisplay === 'MoMo' && <img src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" alt="MoMo" style={{width:22, height:22, borderRadius:4}} />}
                                                {item.methodDisplay === 'PayPal' && <img src="https://www.paypalobjects.com/webstatic/icon/pp258.png" alt="PayPal" style={{width:22, height:22, borderRadius:4}} />}
                                                <span>{item.methodDisplay || item.method}</span>
                                            </td>
                                            <td style={{padding:'12px'}}>{item.payerId || '-'}</td>
                                            <td style={{padding:'12px'}}>{item.status || '-'}</td>
                                            <td style={{padding:'12px'}}>{item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : ''}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
};

export default AdminTopupHistoryPage; 
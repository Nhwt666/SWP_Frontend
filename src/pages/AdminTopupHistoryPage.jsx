import React, { useEffect, useState, useMemo } from 'react';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminTopupHistoryPage.css';
import AdminLayout from '../components/AdminLayout';

const AdminTopupHistoryPage = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterMethod, setFilterMethod] = useState('');
    const [sortOrder, setSortOrder] = useState('newest');
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

    const processedData = useMemo(() => {
        let dataToProcess = [...data];

        dataToProcess.sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            if (sortOrder === 'newest') {
                return dateB - dateA;
            }
            return dateA - dateB;
        });

        if (filterMethod) {
            return dataToProcess.filter(item => item.paymentMethod === filterMethod);
        }

        return dataToProcess;
    }, [data, filterMethod, sortOrder]);

    return (
        <>
            <Header />
            <AdminLayout>
                <div className="admin-topup-history-page">
                    <div style={{width:'100%', maxWidth:1200, display:'flex', alignItems:'center', marginBottom:24, marginLeft:0}}>
                        <button onClick={() => navigate('/admin/dashboard')} style={{marginRight:18, background:'#6c47d8', color:'#fff', border:'none', borderRadius:8, padding:'10px 28px', fontWeight:700, fontSize:18, cursor:'pointer', boxShadow:'0 2px 8px #eee'}}>← Quay lại</button>
                        <h2 style={{color:'#6c47d8', fontWeight:900, fontSize: '2.5rem', margin:0, flex:1, textAlign:'center', letterSpacing:1}}>Lịch sử nạp tiền</h2>
                    </div>
                    <div style={{width:'100%', maxWidth:1200, display:'flex', alignItems:'center', gap:24, marginBottom:18, justifyContent:'flex-start', marginLeft:0}}>
                        <div style={{display:'flex', flexDirection:'column', gap:4}}>
                            <label htmlFor="method-filter" style={{fontWeight:600, color:'#6c47d8'}}>Lọc theo phương thức</label>
                            <select id="method-filter" value={filterMethod} onChange={e => setFilterMethod(e.target.value)} style={{padding:'8px 16px', borderRadius:8, border:'1.5px solid #b39ddb', fontSize:16, minWidth:160}}>
                                <option value="">Tất cả</option>
                                <option value="MOMO">MoMo</option>
                                <option value="PAYPAL">PayPal</option>
                            </select>
                        </div>
                        <div style={{display:'flex', flexDirection:'column', gap:4}}>
                            <label htmlFor="sort-order" style={{fontWeight:600, color:'#6c47d8'}}>Sắp xếp</label>
                            <select id="sort-order" value={sortOrder} onChange={e => setSortOrder(e.target.value)} style={{padding:'8px 16px', borderRadius:8, border:'1.5px solid #b39ddb', fontSize:16, minWidth:160}}>
                                <option value="newest">Gần nhất</option>
                                <option value="oldest">Lâu nhất</option>
                            </select>
                        </div>
                        <button onClick={()=>setFilterMethod('')} style={{background:'#eee', color:'#6c47d8', border:'none', borderRadius:8, padding:'8px 22px', fontWeight:600, fontSize:16, cursor:'pointer', boxShadow:'0 1px 4px #eee', alignSelf:'flex-end'}}>Xóa bộ lọc</button>
                    </div>
                    {loading ? (
                        <div>Đang tải dữ liệu...</div>
                    ) : error ? (
                        <div style={{color:'red'}}>{error}</div>
                    ) : (
                        <div style={{width:'100%', maxWidth:1200, marginLeft:0}}>
                            <table style={{width:'100%', background:'#fff', borderRadius:20, boxShadow:'0 6px 24px #e0e0e0', fontSize:16}}>
                                <thead>
                                    <tr style={{background:'#f3e8ff', color:'#6c47d8'}}>
                                        <th style={{padding:'18px 14px'}}>STT</th>
                                        <th style={{padding:'18px 14px'}}>USER</th>
                                        <th style={{padding:'18px 14px'}}>EMAIL</th>
                                        <th style={{padding:'18px 14px'}}>SỐ TIỀN</th>
                                        <th style={{padding:'18px 14px'}}>PHƯƠNG THỨC</th>
                                        <th style={{padding:'18px 14px', minWidth:140}}>MÃ GIAO DỊCH</th>
                                        <th style={{padding:'18px 14px', minWidth:160}}>NGÀY NẠP</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {processedData.length === 0 ? (
                                        <tr><td colSpan={8} style={{textAlign:'center', color:'#888'}}>Không có dữ liệu.</td></tr>
                                    ) : processedData.map((item, idx) => (
                                        <tr key={item.id || idx}>
                                            <td style={{padding:'16px', textAlign:'center'}}>{idx+1}</td>
                                            <td style={{padding:'16px'}}>{item.userName || 'Ẩn'}</td>
                                            <td style={{padding:'16px'}}>{item.userEmail || 'Ẩn'}</td>
                                            <td style={{padding:'16px', color:'#e53e9f', fontWeight:700}}>{Number(item.amount).toLocaleString('vi-VN')}đ</td>
                                            <td style={{padding:'16px', display:'flex', alignItems:'center', gap:8}}>
                                                {(item.paymentMethod === 'MOMO') && <img src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" alt="MoMo" style={{width:24, height:24, borderRadius:4}} />}
                                                <span style={{fontSize:26}}>{item.paymentMethod === 'MOMO' ? 'MoMo' : item.paymentMethod === 'PAYPAL' ? 'PayPal' : item.paymentMethod || '-'}</span>
                                            </td>
                                            <td style={{padding:'16px', minWidth:140, whiteSpace:'nowrap'}}>{item.payerId || '-'}</td>
                                            <td style={{padding:'16px', minWidth:160, whiteSpace:'nowrap'}}>{item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN', { hour12: false }) : '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </AdminLayout>
        </>
    );
};

export default AdminTopupHistoryPage; 
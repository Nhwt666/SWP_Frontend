import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import AdminLayout from '../components/AdminLayout';

const defaultVouchers = [];

export default function AdminVoucherPage() {
  const [vouchers, setVouchers] = useState(defaultVouchers);
  const [form, setForm] = useState({ name: '', type: 'percent', value: '', start: '', endDate: '' });
  const [editId, setEditId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [timer, setTimer] = useState(Date.now());

  // Fetch vouchers from backend
  const fetchVouchers = async () => {
    try {
      const res = await fetch('/api/vouchers', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setVouchers(data);
      } else {
        setVouchers([]);
      }
    } catch {
      setVouchers([]);
    }
  };

  useEffect(() => {
    fetchVouchers();
    const interval = setInterval(() => setTimer(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleCreate = async e => {
    e.preventDefault();
    if (!form.name || !form.value || !form.start || !form.endDate) return;
    const body = {
      name: form.name,
      type: form.type,
      value: Number(form.value),
      start: form.start,
      endDate: form.endDate,
    };
    await fetch('/api/vouchers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(body)
    });
    setForm({ name: '', type: 'percent', value: '', start: '', endDate: '' });
    fetchVouchers();
  };

  const handleDelete = async id => {
    await fetch(`/api/vouchers/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    fetchVouchers();
  };

  const handleEdit = id => {
    setEditId(id);
    const v = vouchers.find(v => v.id === id);
    setEditValue(v.value);
  };

  const handleEditSave = async id => {
    await fetch(`/api/vouchers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ value: Number(editValue) })
    });
    setEditId(null);
    setEditValue('');
    fetchVouchers();
  };

  const handleAddTime = async (id, ms) => {
    const v = vouchers.find(v => v.id === id);
    if (!v) return;
    const newEnd = new Date(new Date(v.endDate).getTime() + ms);
    await fetch(`/api/vouchers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ endDate: newEnd.toISOString().slice(0, 16) })
    });
    fetchVouchers();
  };

  function formatTimeLeft(ms) {
    if (ms <= 0) return 'Đã hết hạn';
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${days > 0 ? days + 'd ' : ''}${hours}h ${minutes}m ${seconds}s`;
  }

  return (
    <>
    <Header />
    <AdminLayout>
      <div style={{ maxWidth: 800, margin: '32px auto', background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px #2979ff11', padding: 32 }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>Quản lý Voucher</h2>
        <form onSubmit={handleCreate} style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'end', marginBottom: 32 }}>
          <div>
            <label>Tên voucher<br /><input name="name" value={form.name} onChange={handleChange} required style={{ width: 120 }} /></label>
          </div>
          <div>
            <label>Loại<br />
              <select name="type" value={form.type} onChange={handleChange}>
                <option value="percent">%</option>
                <option value="amount">VNĐ</option>
              </select>
            </label>
          </div>
          <div>
            <label>Giá trị<br /><input name="value" type="number" value={form.value} onChange={handleChange} required min={1} style={{ width: 80 }} /></label>
          </div>
          <div>
            <label>Bắt đầu<br /><input name="start" type="datetime-local" value={form.start} onChange={handleChange} required /></label>
          </div>
          <div>
            <label>Kết thúc<br /><input name="endDate" type="datetime-local" value={form.endDate} onChange={handleChange} required /></label>
          </div>
          <button type="submit" style={{ padding: '8px 18px', background: '#2979ff', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600 }}>Tạo voucher</button>
        </form>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#f7fafd', borderRadius: 12, overflow: 'hidden' }}>
          <thead>
            <tr style={{ background: '#e3f0ff' }}>
              <th style={{ padding: 10 }}>Tên</th>
              <th style={{ padding: 10 }}>Loại</th>
              <th style={{ padding: 10 }}>Giá trị</th>
              <th style={{ padding: 10 }}>Hiệu lực</th>
              <th style={{ padding: 10 }}>Còn lại</th>
              <th style={{ padding: 10 }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {vouchers.map(v => (
              <tr key={v.id} style={{ textAlign: 'center', borderBottom: '1px solid #e3f0ff' }}>
                <td>{v.name}</td>
                <td>{v.type === 'percent' ? '%' : 'VNĐ'}</td>
                <td>
                  {editId === v.id ? (
                    <>
                      <input type="number" value={editValue} onChange={e => setEditValue(e.target.value)} style={{ width: 60 }} />
                      <button onClick={() => handleEditSave(v.id)} style={{ marginLeft: 6, color: '#2979ff', border: 'none', background: 'none', fontWeight: 600 }}>Lưu</button>
                    </>
                  ) : (
                    <>
                      {v.value.toLocaleString()} {v.type === 'percent' ? '%' : 'VNĐ'}
                      <button onClick={() => handleEdit(v.id)} style={{ marginLeft: 6, color: '#2979ff', border: 'none', background: 'none', fontWeight: 600 }}>Sửa</button>
                    </>
                  )}
                </td>
                <td>{new Date(v.start).toLocaleString()}<br />-<br />{new Date(v.endDate).toLocaleString()}</td>
                <td style={{ color: (new Date(v.endDate) - timer) > 0 ? '#2979ff' : '#f44336', fontWeight: 600 }}>{formatTimeLeft(new Date(v.endDate) - timer)}</td>
                <td>
                  <button onClick={() => handleAddTime(v.id, 3600*1000)} style={{ marginRight: 6, color: '#43a047', border: 'none', background: 'none', fontWeight: 600 }}>+1h</button>
                  <button onClick={() => handleAddTime(v.id, 24*3600*1000)} style={{ marginRight: 6, color: '#43a047', border: 'none', background: 'none', fontWeight: 600 }}>+1 ngày</button>
                  <button onClick={() => handleDelete(v.id)} style={{ color: '#f44336', border: 'none', background: 'none', fontWeight: 600 }}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
      </div>
    </AdminLayout>
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
} 
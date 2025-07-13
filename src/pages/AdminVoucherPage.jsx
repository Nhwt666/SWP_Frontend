import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import AdminLayout from '../components/AdminLayout';
import { FaEdit, FaTrash, FaCheck, FaTimes, FaPlusCircle, FaClock, FaCalendarDay } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';

const defaultVouchers = [];

export default function AdminVoucherPage() {
  const [vouchers, setVouchers] = useState(defaultVouchers);
  const [form, setForm] = useState({ name: '', type: 'percent', value: '', start: '', endDate: '' });
  const [editId, setEditId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [timer, setTimer] = useState(Date.now());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

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
    setDeleteId(id);
    setShowDeleteModal(true);
  };
  const confirmDelete = async () => {
    await fetch(`/api/vouchers/${deleteId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    setShowDeleteModal(false);
    setDeleteId(null);
    fetchVouchers();
  };
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteId(null);
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

  // Responsive: tính số voucher còn hiệu lực
  const now = Date.now();
  const activeCount = vouchers.filter(v => new Date(v.endDate) > now).length;

  return (
    <>
    <Header />
    <AdminLayout>
      <div style={{ maxWidth: 900, margin: '32px auto', background: '#fff', borderRadius: 20, boxShadow: '0 4px 24px #2979ff22', padding: 32 }}>
        <h2 style={{ fontSize: 30, fontWeight: 800, marginBottom: 10, color: '#1976d2', letterSpacing: 1 }}>Quản lý Voucher</h2>
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 18, color: '#43a047' }}>
          <FaCalendarDay style={{ marginRight: 8, color: '#43a047' }} />
          Đang còn hiệu lực: {activeCount} voucher
        </div>
        <form onSubmit={handleCreate} style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 18,
          alignItems: 'end',
          marginBottom: 36,
          border: '1.5px solid #e3f0ff',
          borderRadius: 12,
          padding: 18,
          background: '#f7fafd',
          maxWidth: 900,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontWeight: 600 }}>Tên voucher</label>
            <input name="name" value={form.name} onChange={handleChange} required style={{ borderRadius: 8, border: '1.5px solid #b3c6e0', padding: 8, fontSize: 16, width: '100%' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontWeight: 600 }}>Loại</label>
            <select name="type" value={form.type} onChange={handleChange} style={{ borderRadius: 8, border: '1.5px solid #b3c6e0', padding: 8, fontSize: 16, width: '100%' }}>
              <option value="percent">%</option>
              <option value="amount">VNĐ</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontWeight: 600 }}>Giá trị</label>
            <input name="value" type="number" value={form.value} onChange={handleChange} required min={1} style={{ borderRadius: 8, border: '1.5px solid #b3c6e0', padding: 8, fontSize: 16, width: '100%' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontWeight: 600 }}>Bắt đầu</label>
            <input name="start" type="datetime-local" value={form.start} onChange={handleChange} required style={{ borderRadius: 8, border: '1.5px solid #b3c6e0', padding: 8, fontSize: 16, width: '100%' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontWeight: 600 }}>Kết thúc</label>
            <input name="endDate" type="datetime-local" value={form.endDate} onChange={handleChange} required style={{ borderRadius: 8, border: '1.5px solid #b3c6e0', padding: 8, fontSize: 16, width: '100%' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', height: '100%' }}>
            <button type="submit" style={{ padding: '10px 22px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 17, boxShadow: '0 2px 8px #1976d233', display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}><FaPlusCircle />Tạo voucher</button>
          </div>
        </form>
        <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#f7fafd', borderRadius: 16, overflow: 'hidden', fontSize: 17, minWidth: 700 }}>
          <thead>
            <tr style={{ background: '#e3f0ff' }}>
              <th style={{ padding: 12 }}>Tên</th>
              <th style={{ padding: 12 }}>Loại</th>
              <th style={{ padding: 12 }}>Giá trị</th>
              <th style={{ padding: 12 }}>Hiệu lực</th>
              <th style={{ padding: 12 }}>Còn lại</th>
              <th style={{ padding: 12 }}>Trạng thái</th>
              <th style={{ padding: 12 }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {vouchers.map(v => {
              const isActive = new Date(v.endDate) > now;
              return (
              <tr key={v.id} style={{ textAlign: 'center', borderBottom: '1px solid #e3f0ff', background: isActive ? '#fff' : '#fbe9e7' }}>
                <td>{v.name}</td>
                <td>{v.type === 'percent' ? '%' : 'VNĐ'}</td>
                <td>
                  {editId === v.id ? (
                    <>
                      <input type="number" value={editValue} onChange={e => setEditValue(e.target.value)} style={{ width: 70, borderRadius: 6, border: '1.5px solid #b3c6e0', padding: 6, fontSize: 16 }} />
                      <FaCheck style={{ color: '#43a047', marginLeft: 8, cursor: 'pointer' }} onClick={() => handleEditSave(v.id)} title="Lưu" />
                      <FaTimes style={{ color: '#e53935', marginLeft: 6, cursor: 'pointer' }} onClick={() => { setEditId(null); setEditValue(''); }} title="Hủy" />
                    </>
                  ) : (
                    <>
                      {v.value.toLocaleString()} {v.type === 'percent' ? '%' : 'VNĐ'}
                      <FaEdit style={{ marginLeft: 8, color: '#1976d2', cursor: 'pointer' }} onClick={() => handleEdit(v.id)} title="Sửa giá trị" />
                    </>
                  )}
                </td>
                <td>{new Date(v.start).toLocaleString()}<br />-<br />{new Date(v.endDate).toLocaleString()}</td>
                <td style={{ color: isActive ? '#2979ff' : '#f44336', fontWeight: 600 }}>{formatTimeLeft(new Date(v.endDate) - now)}</td>
                <td>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 14px',
                    borderRadius: 12,
                    fontWeight: 700,
                    color: isActive ? '#fff' : '#fff',
                    background: isActive ? '#43a047' : '#e53935',
                    fontSize: 15
                  }}>{isActive ? 'Còn hạn' : 'Hết hạn'}</span>
                </td>
                <td style={{ minWidth: 180 }}>
                  <Tooltip id={`tip-add1h-${v.id}`} content="Gia hạn thêm 1 giờ" />
                  <Tooltip id={`tip-add1d-${v.id}`} content="Gia hạn thêm 1 ngày" />
                  <Tooltip id={`tip-edit-${v.id}`} content="Sửa giá trị" />
                  <Tooltip id={`tip-delete-${v.id}`} content="Xóa voucher" />
                  <FaClock data-tooltip-id={`tip-add1h-${v.id}`} style={{ color: '#43a047', marginRight: 10, cursor: 'pointer' }} onClick={() => handleAddTime(v.id, 3600*1000)} />
                  <FaCalendarDay data-tooltip-id={`tip-add1d-${v.id}`} style={{ color: '#43a047', marginRight: 10, cursor: 'pointer' }} onClick={() => handleAddTime(v.id, 24*3600*1000)} />
                  <FaTrash data-tooltip-id={`tip-delete-${v.id}`} style={{ color: '#e53935', marginRight: 10, cursor: 'pointer' }} onClick={() => handleDelete(v.id)} />
                </td>
              </tr>
            )})}
          </tbody>
        </table>
        </div>
        {/* Modal xác nhận xóa voucher */}
        {showDeleteModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
            <div style={{ background: '#fff', borderRadius: 16, padding: 36, minWidth: 320, maxWidth: 380, boxShadow: '0 4px 32px rgba(30,58,138,0.18)', textAlign: 'center', position: 'relative' }}>
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 18, color: '#e53935' }}><FaTrash style={{ marginRight: 8 }} />Xác nhận xóa voucher?</div>
              <div style={{ fontSize: 16, marginBottom: 24 }}>Bạn có chắc chắn muốn xóa voucher này? Thao tác này không thể hoàn tác.</div>
              <button onClick={confirmDelete} style={{ background: '#e53935', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 28px', fontWeight: 700, fontSize: 16, cursor: 'pointer', marginRight: 12 }}>Xóa</button>
              <button onClick={cancelDelete} style={{ background: '#eee', color: '#e53935', border: 'none', borderRadius: 8, padding: '10px 28px', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>Hủy</button>
            </div>
          </div>
        )}
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
import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import Header from '../components/Header';
import '../styles/AdminDashboardPage.css';
import { FaSearch, FaSort, FaSortUp, FaSortDown, FaEdit, FaTrash } from 'react-icons/fa';

const AdminPricesPage = () => {
    const [prices, setPrices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterType, setFilterType] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState('id');
    const [sortDirection, setSortDirection] = useState('asc');
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editRow, setEditRow] = useState(null);
    const [editForm, setEditForm] = useState({ value: '', currency: '', name: '', type: '' });
    const [deleteId, setDeleteId] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [createForm, setCreateForm] = useState({ value: '', currency: 'VND', name: '', type: 'CIVIL' });

    const handleTypeChange = (e) => setFilterType(e.target.value);
    const handleSearchChange = (e) => setSearchTerm(e.target.value);

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const getSortIcon = (field) => {
        if (sortField !== field) return <FaSort style={{ marginLeft: 4, color: '#ccc' }} />;
        return sortDirection === 'asc' 
            ? <FaSortUp style={{ marginLeft: 4, color: '#1976d2' }} />
            : <FaSortDown style={{ marginLeft: 4, color: '#1976d2' }} />;
    };

    const filteredPrices = prices.filter(row => {
        const matchesType = filterType === 'ALL' || row.type === filterType;
        const matchesSearch = row.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesType && matchesSearch;
    });

    const sortedPrices = [...filteredPrices].sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];

        if (sortField === 'value') {
            aValue = Number(aValue);
            bValue = Number(bValue);
        } else if (sortField === 'createdAt') {
            aValue = new Date(aValue).getTime();
            bValue = new Date(bValue).getTime();
        } else {
            aValue = String(aValue).toLowerCase();
            bValue = String(bValue).toLowerCase();
        }

        if (sortDirection === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    useEffect(() => {
        const fetchPrices = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('/admin/prices', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!res.ok) throw new Error('Không thể tải dữ liệu bảng giá');
                const data = await res.json();
                setPrices(data);
            } catch (err) {
                setError(err.message || 'Lỗi không xác định');
            } finally {
                setLoading(false);
            }
        };
        fetchPrices();
    }, []);

    const openEditModal = (row) => {
        setEditRow(row);
        setEditForm({ value: row.value, currency: row.currency, name: row.name, type: row.type });
        setEditModalOpen(true);
    };
    const closeEditModal = () => {
        setEditModalOpen(false);
        setEditRow(null);
    };
    const handleEditChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/admin/prices/${editRow.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editForm)
            });
            if (!res.ok) throw new Error('Cập nhật thất bại');
            const updated = await res.json();
            setPrices(prices => prices.map(p => p.id === updated.id ? updated : p));
            closeEditModal();
        } catch (err) {
            alert(err.message || 'Lỗi không xác định');
        } finally {
            setActionLoading(false);
        }
    };
    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa giá này?')) return;
        setActionLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/admin/prices/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Xóa thất bại');
            setPrices(prices => prices.filter(p => p.id !== id));
        } catch (err) {
            alert(err.message || 'Lỗi không xác định');
        } finally {
            setActionLoading(false);
        }
    };

    const openCreateModal = () => {
        setCreateForm({ value: '', currency: 'VND', name: '', type: 'CIVIL' });
        setCreateModalOpen(true);
    };
    const closeCreateModal = () => setCreateModalOpen(false);
    const handleCreateChange = (e) => {
        setCreateForm({ ...createForm, [e.target.name]: e.target.value });
    };
    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/admin/prices', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(createForm)
            });
            if (!res.ok) throw new Error('Tạo mới thất bại');
            const created = await res.json();
            setPrices(prices => [...prices, created]);
            closeCreateModal();
        } catch (err) {
            alert(err.message || 'Lỗi không xác định');
        } finally {
            setActionLoading(false);
        }
    };

    const headers = [
        { key: 'id', label: 'STT' },
        { key: 'value', label: 'GIÁ TRỊ' },
        { key: 'currency', label: 'TIỀN TỆ' },
        { key: 'name', label: 'TÊN DỊCH VỤ' },
        { key: 'createdAt', label: 'NGÀY TẠO' },
        { key: 'type', label: 'LOẠI' },
        { key: 'actions', label: 'HÀNH ĐỘNG' },
    ];

    const formatValue = (val) => Number(val).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? '-' : d.toLocaleString('vi-VN');
    };
    const formatType = (type) => type === 'CIVIL' ? 'Dân Sự' : type === 'ADMINISTRATIVE' ? 'Hành Chính' : 'Khác';

    return (
        <>
            <Header />
            <AdminLayout>
                <div className="dashboard-content">
                    <div className="dashboard-main-box">
                        <header className="dashboard-header">
                            <h2>Bảng Giá Dịch Vụ</h2>
                            <div className="admin-badge">Quản trị viên</div>
                        </header>
                        <div style={{
                            display: 'flex',
                            gap: 24,
                            marginBottom: 32,
                            alignItems: 'center',
                            background: '#fff',
                            borderRadius: 12,
                            boxShadow: '0 2px 12px rgba(60,60,120,0.07)',
                            padding: '18px 28px',
                            maxWidth: 600,
                            width: '100%',
                            flexWrap: 'wrap',
                        }}>
                            <label style={{ fontWeight: 600, color: '#333', fontSize: 16 }}>
                                Lọc theo loại:
                                <select
                                    value={filterType}
                                    onChange={handleTypeChange}
                                    style={{
                                        marginLeft: 10,
                                        padding: '8px 16px',
                                        borderRadius: 8,
                                        border: '1px solid #d0d0d0',
                                        fontSize: 15,
                                        background: '#f7f7fa',
                                        fontWeight: 500,
                                        outline: 'none',
                                        transition: 'border 0.2s',
                                    }}
                                >
                                    <option value="ALL">Tất cả</option>
                                    <option value="CIVIL">Dân Sự</option>
                                    <option value="ADMINISTRATIVE">Hành Chính</option>
                                    <option value="OTHER">Khác</option>
                                </select>
                            </label>
                            <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
                                <FaSearch style={{
                                    position: 'absolute',
                                    left: 14,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#aaa',
                                    fontSize: 16
                                }} />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm theo tên dịch vụ..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    style={{
                                        padding: '10px 16px 10px 38px',
                                        borderRadius: 8,
                                        border: '1.5px solid #d0d0d0',
                                        fontSize: 16,
                                        width: '100%',
                                        background: '#f7f7fa',
                                        fontWeight: 500,
                                        outline: 'none',
                                        boxShadow: '0 1px 4px rgba(60,60,120,0.04)',
                                        transition: 'border 0.2s',
                                    }}
                                    onFocus={e => e.target.style.border = '1.5px solid #1976d2'}
                                    onBlur={e => e.target.style.border = '1.5px solid #d0d0d0'}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', marginBottom: 18 }}>
                            <button onClick={openCreateModal} style={{ background: '#6c47d8', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 28px', fontWeight: 700, fontSize: 17, cursor: 'pointer', boxShadow: '0 2px 8px #eee', transition: 'background 0.18s' }}>
                                + Tạo dịch vụ mới
                            </button>
                        </div>
                        {loading && <div>Đang tải dữ liệu...</div>}
                        {error && <div style={{color: 'red'}}>Lỗi: {error}</div>}
                        {!loading && !error && sortedPrices && Array.isArray(sortedPrices) && sortedPrices.length > 0 && (
                            <section className="recent-submissions">
                                <table>
                                    <thead>
                                        <tr>
                                            {headers.map(h => (
                                                <th
                                                    key={h.key}
                                                    onClick={() => handleSort(h.key)}
                                                    style={{ cursor: 'pointer', userSelect: 'none' }}
                                                >
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                                                        {h.label}
                                                        {getSortIcon(h.key)}
                                                    </span>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedPrices.map((row, i) => (
                                            <tr key={row.id || i}>
                                                <td>{row.id}</td>
                                                <td>{formatValue(row.value)}</td>
                                                <td>{row.currency}</td>
                                                <td>{row.name}</td>
                                                <td style={{ whiteSpace: 'pre-line' }}>{formatDate(row.createdAt)}</td>
                                                <td>{formatType(row.type)}</td>
                                                <td>
                                                    <button onClick={() => openEditModal(row)}
                                                        style={{ background: '#e0f7fa', color: '#6c47d8', border: 'none', borderRadius: 8, padding: '7px 12px', marginRight: 8, cursor: 'pointer', fontSize: 17, transition: 'background 0.18s' }}
                                                        title="Sửa"
                                                        onMouseOver={e => e.currentTarget.style.background = '#d1c4e9'}
                                                        onMouseOut={e => e.currentTarget.style.background = '#e0f7fa'}
                                                    ><FaEdit /></button>
                                                    <button onClick={() => handleDelete(row.id)}
                                                        style={{ background: '#ffeaea', color: '#d32f2f', border: 'none', borderRadius: 8, padding: '7px 12px', cursor: 'pointer', fontSize: 17, transition: 'background 0.18s' }}
                                                        title="Xóa"
                                                        onMouseOver={e => e.currentTarget.style.background = '#ffcdd2'}
                                                        onMouseOut={e => e.currentTarget.style.background = '#ffeaea'}
                                                    ><FaTrash /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </section>
                        )}
                        {!loading && !error && (!sortedPrices || sortedPrices.length === 0) && (
                            <div>Không có dữ liệu bảng giá phù hợp.</div>
                        )}
                    </div>
                </div>
            </AdminLayout>
            {editModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    background: 'rgba(60, 40, 120, 0.22)',
                    backdropFilter: 'blur(2px)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'fadeInAnim 0.25s',
                }}>
                    <form onSubmit={handleEditSubmit} style={{
                        background: '#fff',
                        borderRadius: 20,
                        padding: '36px 32px 28px 32px',
                        minWidth: 340,
                        boxShadow: '0 6px 32px 0 rgba(108, 71, 216, 0.18)',
                        border: '1.5px solid #e0f7fa',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 20,
                        fontFamily: 'Be Vietnam Pro, Inter, Arial, sans-serif',
                        animation: 'fadeInAnim 0.25s',
                    }}>
                        <h3 style={{ color: '#6c47d8', margin: 0, fontWeight: 800, fontSize: 22, textAlign: 'center', letterSpacing: 1 }}>Chỉnh sửa giá</h3>
                        <label style={{ fontWeight: 600, color: '#333', fontSize: 15 }}>Giá trị
                            <input name="value" type="number" value={editForm.value} onChange={handleEditChange} required style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e0f7fa', marginTop: 6, fontSize: 16, outline: 'none', transition: 'border 0.2s' }} />
                        </label>
                        <label style={{ fontWeight: 600, color: '#333', fontSize: 15 }}>Tiền tệ
                            <input name="currency" value={editForm.currency} onChange={handleEditChange} required style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e0f7fa', marginTop: 6, fontSize: 16, outline: 'none', transition: 'border 0.2s' }} />
                        </label>
                        <label style={{ fontWeight: 600, color: '#333', fontSize: 15 }}>Tên dịch vụ
                            <input name="name" value={editForm.name} onChange={handleEditChange} required style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e0f7fa', marginTop: 6, fontSize: 16, outline: 'none', transition: 'border 0.2s' }} />
                        </label>
                        <label style={{ fontWeight: 600, color: '#333', fontSize: 15 }}>Loại
                            <select name="type" value={editForm.type} onChange={handleEditChange} required style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e0f7fa', marginTop: 6, fontSize: 16, outline: 'none', background: '#f7f7fa', fontWeight: 500 }}>
                                <option value="CIVIL">Dân Sự</option>
                                <option value="ADMINISTRATIVE">Hành Chính</option>
                                <option value="OTHER">Khác</option>
                            </select>
                        </label>
                        <div style={{ display: 'flex', gap: 14, marginTop: 8 }}>
                            <button type="button" onClick={closeEditModal} style={{ flex: 1, background: '#eee', color: '#6c47d8', border: 'none', borderRadius: 10, padding: '12px 0', fontWeight: 700, fontSize: 16, cursor: 'pointer', transition: 'background 0.18s' }}>Hủy</button>
                            <button type="submit" disabled={actionLoading} style={{ flex: 1, background: '#6c47d8', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 0', fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px #eee', transition: 'background 0.18s' }}>{actionLoading ? 'Đang lưu...' : 'Lưu'}</button>
                        </div>
                    </form>
                </div>
            )}
            {createModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    background: 'rgba(60, 40, 120, 0.22)',
                    backdropFilter: 'blur(2px)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'fadeInAnim 0.25s',
                }}>
                    <form onSubmit={handleCreateSubmit} style={{
                        background: '#fff',
                        borderRadius: 20,
                        padding: '36px 32px 28px 32px',
                        minWidth: 340,
                        boxShadow: '0 6px 32px 0 rgba(108, 71, 216, 0.18)',
                        border: '1.5px solid #e0f7fa',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 20,
                        fontFamily: 'Be Vietnam Pro, Inter, Arial, sans-serif',
                        animation: 'fadeInAnim 0.25s',
                    }}>
                        <h3 style={{ color: '#6c47d8', margin: 0, fontWeight: 800, fontSize: 22, textAlign: 'center', letterSpacing: 1 }}>Tạo dịch vụ mới</h3>
                        <label style={{ fontWeight: 600, color: '#333', fontSize: 15 }}>Giá trị
                            <input name="value" type="number" value={createForm.value} onChange={handleCreateChange} required style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e0f7fa', marginTop: 6, fontSize: 16, outline: 'none', transition: 'border 0.2s' }} />
                        </label>
                        <label style={{ fontWeight: 600, color: '#333', fontSize: 15 }}>Tiền tệ
                            <input name="currency" value={createForm.currency} onChange={handleCreateChange} required style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e0f7fa', marginTop: 6, fontSize: 16, outline: 'none', transition: 'border 0.2s' }} />
                        </label>
                        <label style={{ fontWeight: 600, color: '#333', fontSize: 15 }}>Tên dịch vụ
                            <input name="name" value={createForm.name} onChange={handleCreateChange} required style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e0f7fa', marginTop: 6, fontSize: 16, outline: 'none', transition: 'border 0.2s' }} />
                        </label>
                        <label style={{ fontWeight: 600, color: '#333', fontSize: 15 }}>Loại
                            <select name="type" value={createForm.type} onChange={handleCreateChange} required style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e0f7fa', marginTop: 6, fontSize: 16, outline: 'none', background: '#f7f7fa', fontWeight: 500 }}>
                                <option value="CIVIL">Dân Sự</option>
                                <option value="ADMINISTRATIVE">Hành Chính</option>
                                <option value="OTHER">Khác</option>
                            </select>
                        </label>
                        <div style={{ display: 'flex', gap: 14, marginTop: 8 }}>
                            <button type="button" onClick={closeCreateModal} style={{ flex: 1, background: '#eee', color: '#6c47d8', border: 'none', borderRadius: 10, padding: '12px 0', fontWeight: 700, fontSize: 16, cursor: 'pointer', transition: 'background 0.18s' }}>Hủy</button>
                            <button type="submit" disabled={actionLoading} style={{ flex: 1, background: '#6c47d8', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 0', fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px #eee', transition: 'background 0.18s' }}>{actionLoading ? 'Đang tạo...' : 'Tạo mới'}</button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
};

export default AdminPricesPage; 
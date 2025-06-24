import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminUsersPage.css';
import UserCreateModal from '../components/UserCreateModal';
import UserEditModal from '../components/UserEditModal';
import Header from '../components/Header';

const AdminUsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({ role: '', search: '' });
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createUserError, setCreateUserError] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [editUserError, setEditUserError] = useState('');

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            
            const params = new URLSearchParams();
            if (filters.role) {
                params.append('role', filters.role);
            }
            if (filters.search) {
                params.append('keyword', filters.search);
            }
            
            const response = await fetch(`/admin/all-users?${params.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                const errorText = await response.text().catch(() => 'Could not read error response');
                throw new Error(`Failed to fetch users: ${errorText || response.statusText}`);
            }
            
            const data = response.status === 204 ? [] : await response.json();
            setUsers(data);
        } catch (err) {
            console.error("Error fetching users:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [filters, navigate]);

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) { navigate('/login'); return; }
                const meResponse = await fetch('/auth/me', { headers: { 'Authorization': `Bearer ${token}` } });
                if (!meResponse.ok) {
                    // Don't overwrite fetchUsers error if it fails
                    console.error('Failed to fetch current user profile.');
                } else {
                    const meData = await meResponse.json();
                    setCurrentUser(meData);
                }
            } catch (err) {
                 console.error("Error fetching current user:", err);
            }
        };
        
        fetchCurrentUser();
    }, [navigate]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const resetFilters = () => {
        setFilters({ role: '', search: '' });
    };

    const handleSaveUser = async (newUserData) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/admin/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newUserData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Không thể tạo người dùng');
            }
            
            alert('Tạo người dùng mới thành công!');
            handleCloseModal();
            fetchUsers(); // Re-fetch with current filters

        } catch (err) {
            console.error('Error creating user:', err);
            setCreateUserError(err.message);
        }
    };

    const handleUpdateUser = async (userId, updatedData) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/admin/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Không thể cập nhật người dùng');
            }
            
            alert('Cập nhật người dùng thành công!');
            handleCloseModal();
            fetchUsers(); // Re-fetch data

        } catch (err) {
            console.error('Error updating user:', err);
            setEditUserError(err.message);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (currentUser && currentUser.id === userId) {
            alert("Bạn không thể xóa chính mình.");
            return;
        }

        if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này không?')) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`/admin/users/${userId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    alert('Xóa người dùng thành công!');
                    fetchUsers(); // Re-fetch with current filters
                } else {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || 'Không thể xóa người dùng.');
                }
            } catch (err) {
                console.error('Error deleting user:', err);
                alert(`Lỗi khi xóa người dùng: ${err.message}`);
            }
        }
    };

    const handleCreateNew = () => setIsCreateModalOpen(true);
    const handleEditUser = (user) => {
        setEditingUser(user);
        setIsEditModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsCreateModalOpen(false);
        setIsEditModalOpen(false);
        setCreateUserError('');
        setEditUserError('');
        setEditingUser(null);
    };

    return (
        <>
            <Header />
            <div className="admin-users-page">
                <header className="users-header">
                    <button className="back-btn" onClick={() => navigate('/admin/dashboard')}>&larr;</button>
                    <h1>Quản lý người dùng</h1>
                    <button className="add-user-btn" onClick={handleCreateNew}>+ Thêm người dùng mới</button>
                </header>

                <div className="filters-container">
                    <div className="filter-group">
                        <label htmlFor="role-filter">Lọc theo vai trò</label>
                        <select id="role-filter" name="role" value={filters.role} onChange={handleFilterChange}>
                            <option value="">Tất cả vai trò</option>
                            <option value="CUSTOMER">Customer</option>
                            <option value="STAFF">Staff</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label htmlFor="search-filter">Tìm kiếm</label>
                        <input type="text" id="search-filter" name="search" placeholder="Tên hoặc email..." value={filters.search} onChange={handleFilterChange} />
                    </div>
                    <button className="reset-filters-btn" onClick={resetFilters}>Xóa bộ lọc</button>
                </div>

                {error && <div className="error-container">❌ Lỗi: {error}</div>}

                <div className="users-table-container">
                    {loading ? (
                        <div className="loading-container">⏳ Đang tải dữ liệu...</div>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Họ tên</th>
                                    <th>Email</th>
                                    <th>Số điện thoại</th>
                                    <th>Vai trò</th>
                                    <th>Ticket</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length > 0 ? users.map(item => {
                                    const user = item.user ? item.user : item;
                                    const inProgressTickets = item.inProgressTickets ?? '0';
                                    const completedTickets = item.completedTickets ?? '0';

                                    return (
                                        <tr key={user.id}>
                                            <td>{user.id}</td>
                                            <td>{user.fullName}</td>
                                            <td>{user.email}</td>
                                            <td>{user.phone || 'Chưa Có Thông Tin'}</td>
                                            <td><span className={`role-badge role-${user.role?.toLowerCase()}`}>{user.role}</span></td>
                                            <td className="ticket-cell">
                                                {user.role === 'STAFF' ? (
                                                    <button 
                                                        className="view-tickets-btn" 
                                                        onClick={() => navigate('/admin/tickets', { 
                                                            state: { 
                                                                staffId: user.id, 
                                                                staffName: user.fullName,
                                                                filterStatus: 'IN_PROGRESS' 
                                                            } 
                                                        })}
                                                    >
                                                        Xem
                                                    </button>
                                                ) : user.role === 'CUSTOMER' ? (
                                                    <button
                                                        className="view-tickets-btn"
                                                        onClick={() => navigate('/admin/tickets', {
                                                            state: {
                                                                customerId: user.id,
                                                                customerName: user.fullName,
                                                                filterStatus: ''
                                                            }
                                                        })}
                                                    >
                                                        Xem
                                                    </button>
                                                ) : (
                                                    <button className="view-tickets-btn" disabled style={{opacity: 1, cursor: 'default', background: '#e57373', color: '#fff'}}>None</button>
                                                )}
                                            </td>
                                            <td>
                                                <button className="edit-btn" onClick={() => handleEditUser(user)}>Sửa</button>
                                                <button className="delete-btn" onClick={() => handleDeleteUser(user.id)}>Xóa</button>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan="7">Không tìm thấy người dùng nào.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {isCreateModalOpen && (
                    <UserCreateModal
                        onClose={handleCloseModal}
                        onSave={handleSaveUser}
                        error={createUserError}
                    />
                )}

                {isEditModalOpen && (
                    <UserEditModal
                        user={editingUser}
                        onClose={handleCloseModal}
                        onSave={handleUpdateUser}
                        error={editUserError}
                    />
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

export default AdminUsersPage;

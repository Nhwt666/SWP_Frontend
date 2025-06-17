import React, { useEffect, useState } from 'react';
import '../styles/AdminUsersPage.css';
import '../styles/AdminDashboardPage.css'; // tái sử dụng sidebar & layout
import { useNavigate } from 'react-router-dom';

const AdminUsersPage = () => {
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '' });
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const fetchUsers = async () => {
        try {
            const res = await fetch('/admin/users', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            setUsers(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/admin/users/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(newUser)
            });

            if (res.ok) {
                setMessage('✅ Tạo tài khoản thành công!');
                setNewUser({ name: '', email: '', password: '' });
                fetchUsers();
            } else {
                setMessage('❌ Tạo tài khoản thất bại!');
            }
        } catch (err) {
            setMessage('❌ Lỗi máy chủ!');
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className="admin-dashboard-container">
            <aside className="sidebar">
                <div className="logo">ADN ADMIN</div>
                <nav>
                    <ul>
                        <li onClick={() => navigate('/admin/dashboard')}>Bảng điều khiển</li>
                        <li onClick={() => navigate('/admin/users')}>Người dùng</li>
                        <li>Xét nghiệm ADN</li>
                        <li>Báo cáo</li>
                        <li>Cài đặt</li>
                    </ul>
                </nav>
            </aside>

            <main className="dashboard-content">
                <h2>Quản lý nhân viên</h2>

                {message && <p className="message">{message}</p>}

                <form onSubmit={handleCreateUser} className="create-user-form">
                    <input
                        type="text"
                        placeholder="Tên nhân viên"
                        value={newUser.name}
                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                        required
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Mật khẩu"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        required
                    />
                    <button type="submit">Tạo tài khoản</button>
                </form>

                <h3>Danh sách nhân viên</h3>
                <table className="users-table">
                    <thead>
                    <tr>
                        <th>Họ tên</th>
                        <th>Email</th>
                        <th>Ngày tạo</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.map((u) => (
                        <tr key={u.id}>
                            <td>{u.name}</td>
                            <td>{u.email}</td>
                            <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </main>
        </div>
    );
};

export default AdminUsersPage;

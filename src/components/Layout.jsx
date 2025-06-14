import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

const Layout = () => {
    return (
        <>
            <Header />
            <main style={{ padding: '20px', minHeight: 'calc(100vh - 120px)' }}>
                <Outlet />
            </main>
            <footer style={{ textAlign: 'center', padding: '10px 0', background: '#e6ecf2' }}>
                <small>&copy; 2025 Trung Tâm Xét nghiệm ADN. Mọi quyền được bảo lưu.</small>
            </footer>
        </>
    );
};

export default Layout;

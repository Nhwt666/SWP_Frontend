import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import Header from '../components/Header';
import '../styles/AdminDashboardPage.css';

const AdminBlogsPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);


  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ title: '', content: '', imageUrl: '', });


  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', content: '', imageUrl: '' });


  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);


  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 5;
  const totalPages = Math.ceil(blogs.length / blogsPerPage);
  const paginatedBlogs = blogs.slice((currentPage - 1) * blogsPerPage, currentPage * blogsPerPage);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const fetchBlogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/blogs');
      if (!res.ok) throw new Error('Không thể tải dữ liệu blog');
      const data = await res.json();
      setBlogs(data);
    } catch (err) {
      setError(err.message || 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);


  const openCreateModal = () => {
    setCreateForm({ title: '', content: '', imageUrl: '' });
    setCreateModalOpen(true);
  };
  const closeCreateModal = () => setCreateModalOpen(false);
  const handleCreateChange = (e) => {
    setCreateForm({ ...createForm, [e.target.name]: e.target.value });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: createForm.title,
          content: createForm.content,
          imageUrl: createForm.imageUrl
        })
      });
      if (!res.ok) {
        const errText = await res.text();
        setError('Tạo blog thất bại: ' + errText);
        setActionLoading(false);
        return;
      }
      closeCreateModal();
      fetchBlogs();
    } catch (err) {
      setError('Tạo blog thất bại');
    } finally {
      setActionLoading(false);
    }
  };


  const openEditModal = (row) => {
    setEditRow(row);
    setEditForm({ title: row.title, content: row.content, imageUrl: row.imageUrl || '' });
    setEditModalOpen(true);
  };
  const closeEditModal = () => setEditModalOpen(false);
  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/blogs/${editRow.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });
      if (!res.ok) throw new Error('Cập nhật thất bại');
      const updated = await res.json();
      setBlogs(blogs => blogs.map(b => b.id === updated.id ? updated : b));
      closeEditModal();
    } catch (err) {
      alert(err.message || 'Lỗi không xác định');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa bài viết này?')) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/blogs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Xóa thất bại');
      setBlogs(blogs => blogs.filter(b => b.id !== id));
    } catch (err) {
      alert(err.message || 'Lỗi không xác định');
    } finally {
      setActionLoading(false);
    }
  };


  const handleImageUpload = async (e, setForm) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/blogs/upload-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });
      if (!res.ok) {
        const errText = await res.text();
        setUploadError('Tải ảnh lên thất bại: ' + errText);
        setUploading(false);
        return;
      }
      const data = await res.json();
      if (!data.url) {
        setUploadError('Tải ảnh lên thất bại: Không nhận được URL');
        setUploading(false);
        return;
      }
      setForm(f => ({ ...f, imageUrl: data.url }));
    } catch (err) {
      setUploadError('Tải ảnh lên thất bại');
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Header />
      <AdminLayout>
        <div className="dashboard-content">
          <div className="dashboard-main-box">
            <header className="dashboard-header">
              <h2>Quản lý Blog</h2>
              <div className="admin-badge">Quản trị viên</div>
            </header>
            <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', marginBottom: 18 }}>
              <button onClick={openCreateModal} style={{ background: '#6c47d8', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 28px', fontWeight: 700, fontSize: 17, cursor: 'pointer', boxShadow: '0 2px 8px #eee', transition: 'background 0.18s' }}>
                + Tạo bài viết mới
              </button>
            </div>
            {loading && <div>Đang tải dữ liệu...</div>}
            {error && <div style={{ color: 'red' }}>Lỗi: {error}</div>}
            {!loading && !error && blogs && Array.isArray(blogs) && blogs.length > 0 && (
              <section className="recent-submissions">
                <table className="recent-submissions" style={{ width: '100%', background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px 0 rgba(108, 71, 216, 0.06)', fontSize: '1.08rem', marginBottom: 32 }}>
                  <thead>
                    <tr>
                      <th style={{ minWidth: 60 }}>ID</th>
                      <th style={{ minWidth: 180 }}>Tiêu đề</th>
                      <th style={{ minWidth: 120 }}>Ảnh</th>
                      <th style={{ minWidth: 220 }}>Nội dung</th>
                      <th style={{ minWidth: 120 }}>Ngày tạo</th>
                      <th style={{ minWidth: 120 }}>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedBlogs.map((row, i) => (
                      <tr key={row.id || i}>
                        <td>{row.id}</td>
                        <td>{row.title}</td>
                        <td>
                          {row.imageUrl ? (
                            <img src={row.imageUrl} alt={row.title} style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 6 }} />
                          ) : (
                            <span style={{ color: '#aaa' }}>(Không có ảnh)</span>
                          )}
                        </td>
                        <td>{row.content && row.content.length > 80 ? row.content.substring(0, 80) + '...' : row.content}</td>
                        <td>{row.createdAt ? new Date(row.createdAt).toLocaleDateString('vi-VN') : ''}</td>
                        <td>
                          <button onClick={() => openEditModal(row)} style={{ background: '#e0f7fa', color: '#6c47d8', border: 'none', borderRadius: 8, padding: '7px 12px', marginRight: 8, cursor: 'pointer', fontSize: 17, transition: 'background 0.18s' }}>Sửa</button>
                          <button onClick={() => handleDelete(row.id)} style={{ background: '#ffeaea', color: '#d32f2f', border: 'none', borderRadius: 8, padding: '7px 12px', cursor: 'pointer', fontSize: 17, transition: 'background 0.18s' }}>Xóa</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="pagination-controls">
                  <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, idx) => (
                    <button
                      key={idx + 1}
                      onClick={() => handlePageChange(idx + 1)}
                      className={currentPage === idx + 1 ? 'active-page' : ''}
                    >
                      {idx + 1}
                    </button>
                  ))}
                  <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                    Next
                  </button>
                </div>
              </section>
            )}
            {!loading && !error && (!blogs || blogs.length === 0) && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>Không có bài viết nào.</div>
            )}
          </div>
        </div>
      </AdminLayout>

      {createModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(60, 40, 120, 0.22)', backdropFilter: 'blur(2px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeInAnim 0.25s',
        }}>
          <form onSubmit={handleCreateSubmit} style={{ background: '#fff', borderRadius: 20, padding: '36px 32px 28px 32px', minWidth: 340, boxShadow: '0 6px 32px 0 rgba(108, 71, 216, 0.18)', border: '1.5px solid #e0f7fa', display: 'flex', flexDirection: 'column', gap: 20, fontFamily: 'Be Vietnam Pro, Inter, Arial, sans-serif', animation: 'fadeInAnim 0.25s', }}>
            <h3 style={{ color: '#6c47d8', margin: 0, fontWeight: 800, fontSize: 22, textAlign: 'center', letterSpacing: 1 }}>Tạo bài viết mới</h3>
            <label style={{ fontWeight: 600, color: '#333', fontSize: 15 }}>Tiêu đề
              <input name="title" value={createForm.title} onChange={handleCreateChange} required style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e0f7fa', marginTop: 6, fontSize: 16, outline: 'none', transition: 'border 0.2s' }} />
            </label>
            <label style={{ fontWeight: 600, color: '#333', fontSize: 15 }}>Nội dung
              <textarea name="content" value={createForm.content} onChange={handleCreateChange} required rows={5} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e0f7fa', marginTop: 6, fontSize: 16, outline: 'none', transition: 'border 0.2s', resize: 'vertical' }} />
            </label>
            <label style={{ fontWeight: 600, color: '#333', fontSize: 15 }}>Ảnh (tải lên hoặc dán URL)
              <input name="imageUrl" value={createForm.imageUrl} onChange={handleCreateChange} placeholder="Dán URL hoặc tải lên" style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e0f7fa', marginTop: 6, fontSize: 16, outline: 'none', transition: 'border 0.2s' }} />
              <input type="file" accept="image/*" style={{ marginTop: 8 }} onChange={e => handleImageUpload(e, setCreateForm)} disabled={uploading} />
              {uploading && <span style={{ color: '#6c47d8', fontSize: 14, marginLeft: 8 }}>Đang tải ảnh...</span>}
              {uploadError && <span style={{ color: 'red', fontSize: 14, marginLeft: 8 }}>{uploadError}</span>}
              {createForm.imageUrl && <img src={createForm.imageUrl} alt="preview" style={{ marginTop: 10, maxWidth: 120, borderRadius: 8 }} />}
            </label>
            <div style={{ display: 'flex', gap: 14, marginTop: 8 }}>
              <button type="button" onClick={closeCreateModal} style={{ flex: 1, background: '#eee', color: '#6c47d8', border: 'none', borderRadius: 10, padding: '12px 0', fontWeight: 700, fontSize: 16, cursor: 'pointer', transition: 'background 0.18s' }}>Hủy</button>
              <button type="submit" disabled={actionLoading || uploading} style={{ flex: 1, background: '#6c47d8', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 0', fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px #eee', transition: 'background 0.18s' }}>{actionLoading ? 'Đang tạo...' : 'Tạo mới'}</button>
            </div>
          </form>
        </div>
      )}

      {editModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(60, 40, 120, 0.22)', backdropFilter: 'blur(2px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeInAnim 0.25s',
        }}>
          <form onSubmit={handleEditSubmit} style={{ background: '#fff', borderRadius: 20, padding: '36px 32px 28px 32px', minWidth: 340, boxShadow: '0 6px 32px 0 rgba(108, 71, 216, 0.18)', border: '1.5px solid #e0f7fa', display: 'flex', flexDirection: 'column', gap: 20, fontFamily: 'Be Vietnam Pro, Inter, Arial, sans-serif', animation: 'fadeInAnim 0.25s', }}>
            <h3 style={{ color: '#6c47d8', margin: 0, fontWeight: 800, fontSize: 22, textAlign: 'center', letterSpacing: 1 }}>Chỉnh sửa bài viết</h3>
            <label style={{ fontWeight: 600, color: '#333', fontSize: 15 }}>Tiêu đề
              <input name="title" value={editForm.title} onChange={handleEditChange} required style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e0f7fa', marginTop: 6, fontSize: 16, outline: 'none', transition: 'border 0.2s' }} />
            </label>
            <label style={{ fontWeight: 600, color: '#333', fontSize: 15 }}>Nội dung
              <textarea name="content" value={editForm.content} onChange={handleEditChange} required rows={5} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e0f7fa', marginTop: 6, fontSize: 16, outline: 'none', transition: 'border 0.2s', resize: 'vertical' }} />
            </label>
            <label style={{ fontWeight: 600, color: '#333', fontSize: 15 }}>Ảnh (tải lên hoặc dán URL)
              <input name="imageUrl" value={editForm.imageUrl} onChange={handleEditChange} placeholder="Dán URL hoặc tải lên" style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e0f7fa', marginTop: 6, fontSize: 16, outline: 'none', transition: 'border 0.2s' }} />
              <input type="file" accept="image/*" style={{ marginTop: 8 }} onChange={e => handleImageUpload(e, setEditForm)} disabled={uploading} />
              {uploading && <span style={{ color: '#6c47d8', fontSize: 14, marginLeft: 8 }}>Đang tải ảnh...</span>}
              {uploadError && <span style={{ color: 'red', fontSize: 14, marginLeft: 8 }}>{uploadError}</span>}
              {editForm.imageUrl && <img src={editForm.imageUrl} alt="preview" style={{ marginTop: 10, maxWidth: 120, borderRadius: 8 }} />}
            </label>
            <div style={{ display: 'flex', gap: 14, marginTop: 8 }}>
              <button type="button" onClick={closeEditModal} style={{ flex: 1, background: '#eee', color: '#6c47d8', border: 'none', borderRadius: 10, padding: '12px 0', fontWeight: 700, fontSize: 16, cursor: 'pointer', transition: 'background 0.18s' }}>Hủy</button>
              <button type="submit" disabled={actionLoading || uploading} style={{ flex: 1, background: '#6c47d8', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 0', fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px #eee', transition: 'background 0.18s' }}>{actionLoading ? 'Đang lưu...' : 'Lưu'}</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default AdminBlogsPage; 
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/BlogPostPage.css';
import Header from '../components/Header';

const AllBlogsPage = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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
    fetchBlogs();
  }, []);

  return (
    <>
      <Header />
      <main className="blogpost-bg">
        <div className="blogpost-container">
          <h1 className="blogpost-title">Tất cả Tin Tức & Bài Viết</h1>
          {loading && <div style={{ textAlign: 'center', padding: '40px 0' }}>Đang tải dữ liệu...</div>}
          {error && <div style={{ textAlign: 'center', color: 'red', padding: '40px 0' }}>Lỗi: {error}</div>}
          {!loading && !error && blogs && blogs.length > 0 && (
            <div className="blog-grid">
              {blogs.map((post, idx) => (
                <article className="blog-card" key={post.id || idx}>
                  <div className="blog-img-wrap">
                    <img src={post.imageUrl || '/default-blog.jpg'} alt={post.title} className="blog-img" />
                  </div>
                  <div className="blog-content">
                    <h3 className="blog-card-title">{post.title}</h3>
                    <p className="blog-desc">{(post.content && typeof post.content === 'string') ? post.content.substring(0, 150) : ''}...</p>
                    <button 
                      onClick={() => navigate(`/blog/${post.id}`)} 
                      className="blog-btn"
                    >
                      Đọc tiếp
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
          {!loading && !error && (!blogs || blogs.length === 0) && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>Không có bài viết nào.</div>
          )}
        </div>
      </main>
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

export default AllBlogsPage; 
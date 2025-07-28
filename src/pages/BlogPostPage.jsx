import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/BlogPostPage.css';
import Header from '../components/Header';

const BlogPostPage = () => {
  const { slug } = useParams();
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


  if (!slug) {
    return (
      <>
        <Header />
        <main className="blogpost-bg">
          <div className="blogpost-container">
            <h1 className="blogpost-title">Tin Tức & Bài Viết</h1>
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
                        onClick={() => navigate(`/blog/${post.id || post.slug}`)} 
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
  }


  const post = blogs.find((b) => (b.id && b.id.toString() === slug) || b.slug === slug);

  if (!post) {
    return (
      <>
        <Header />
        <div className="blogpost-notfound">
          <h2>Bài viết không tồn tại</h2>
          <button onClick={() => navigate('/blog')} className="blogpost-back-btn">Quay lại danh sách</button>
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
  }

  return (
    <>
      <Header />
      <main className="blogpost-bg">
        <div className="blogpost-container">
          <div className="blogpost-featured-img-wrap">
            <img src={post.imageUrl || '/default-blog.jpg'} alt={post.title} className="blogpost-featured-img" />
          </div>
          <h1 className="blogpost-title">{post.title}</h1>
          <div className="blogpost-meta">
            <span className="blogpost-author">{post.author}</span>
            <span className="blogpost-date">{post.createdAt ? new Date(post.createdAt).toLocaleDateString('vi-VN') : ''}</span>
          </div>
          <div className="blogpost-content">
            {Array.isArray(post.content)
              ? post.content.map((block, idx) => {
                  if (block.type === 'h3') return <h3 key={idx}>{block.text}</h3>;
                  if (block.type === 'h4') return <h4 key={idx}>{block.text}</h4>;
                  if (block.type === 'p') return <p key={idx}>{block.text}</p>;
                  if (block.type === 'highlight') return <div key={idx} style={{background:'#e3f0ff',padding:'10px 16px',borderRadius:8,margin:'12px 0',color:'#2979ff'}}><strong>{block.text}</strong></div>;
                  if (block.type === 'ul' && Array.isArray(block.items)) return <ul key={idx}>{block.items.map((item,i)=><li key={i}>{item}</li>)}</ul>;
                  if (block.type === 'table' && Array.isArray(block.headers) && Array.isArray(block.rows)) return (
                    <table key={idx} className="blogpost-table"><thead><tr>{block.headers.map((h,i)=><th key={i}>{h}</th>)}</tr></thead><tbody>{block.rows.map((row,i)=><tr key={i}>{row.map((cell,j)=><td key={j}>{cell}</td>)}</tr>)}</tbody></table>
                  );
                  return null;
                })
              : (post.content && typeof post.content === 'string')
                ? <div style={{whiteSpace: 'pre-line'}}>{post.content}</div>
                : null}
          </div>
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

export default BlogPostPage; 
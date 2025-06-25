import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import '../styles/HomePage.css';

const images = ['/18009999.png'];

const HomePage = () => {
    return (
        <>
            <Header />
            <main className="homepage-root" style={{padding: 0, margin: 0, background: 'none'}}>
                <div className="slideshow fade-style" aria-label="Image Slideshow">
                    <img
                        src={images[0]}
                        alt="Banner"
                        className="slide active"
                        aria-hidden={false}
                    />
                </div>
                <section className="gallery">
                    <div className="container">
                        <h2 className="section-title">Về Chúng Tôi</h2>
                        <section className="about-section">
                            <div className="about-left">
                                <img src="/nurse.png" alt="Nurse" className="about-avatar" />
                            </div>
                            <div className="about-right">
                                <div className="about-box">
                                    <span className="about-icon">🌟</span>
                                    <div>
                                        <strong>Tiên phong</strong> trong lĩnh vực xét nghiệm ADN tại Việt Nam, với đội ngũ chuyên gia giàu kinh nghiệm.
                                    </div>
                                </div>
                                <div className="about-box">
                                    <span className="about-icon">🧬</span>
                                    <div>
                                        <strong>Thiết bị hiện đại</strong> đạt chuẩn quốc tế, phục vụ các nhu cầu xét nghiệm huyết thống, pháp lý, y tế và di truyền.
                                    </div>
                                </div>
                                <div className="about-box">
                                    <span className="about-icon">🔒</span>
                                    <div>
                                        <strong>Uy tín</strong> qua hàng chục nghìn ca xét nghiệm chính xác và bảo mật, hỗ trợ cho cá nhân và cơ quan pháp luật.
                                    </div>
                                </div>
                                <div className="about-box">
                                    <span className="about-icon">🚀</span>
                                    <div>
                                        Sứ mệnh: <strong>"Chính xác – Bảo mật – Nhanh chóng"</strong>, mang đến dịch vụ ADN đáng tin cậy nhất.
                                    </div>
                                </div>
                            </div>
                        </section>
                        {/* Blog Section */}
                        <section className="blog-section" id="blog-section">
                            <h2 className="section-title blog-title">Tin Tức & Bài Viết</h2>
                            <div className="blog-grid">
                                {[
                                    {
                                        title: 'Tại sao xét nghiệm ADN lại quan trọng?',
                                        image: '/blog1.jpg',
                                        desc: 'Khám phá vai trò của xét nghiệm ADN trong y học hiện đại và các ứng dụng thực tiễn cho gia đình, pháp lý và sức khỏe.',
                                        slug: '1',
                                    },
                                    {
                                        title: 'Quy trình xét nghiệm ADN diễn ra như thế nào?',
                                        image: '/blog2.jpg',
                                        desc: 'Tìm hiểu các bước thực hiện xét nghiệm ADN tại bệnh viện, từ lấy mẫu đến trả kết quả, đảm bảo chính xác và bảo mật.',
                                        slug: '2',
                                    },
                                    {
                                        title: 'Những lầm tưởng phổ biến về xét nghiệm ADN',
                                        image: '/blog3.jpg',
                                        desc: 'Giải đáp các hiểu lầm thường gặp về xét nghiệm ADN và cung cấp thông tin khoa học chính xác cho cộng đồng.',
                                        slug: '3',
                                    },
                                    {
                                        title: 'Xét nghiệm ADN cho trẻ sơ sinh: Khi nào cần thiết?',
                                        image: '/blog4.jpg',
                                        desc: 'Phân tích các trường hợp nên thực hiện xét nghiệm ADN cho trẻ sơ sinh và lợi ích của việc phát hiện sớm các bệnh di truyền.',
                                        slug: '4',
                                    },
                                    {
                                        title: 'Bảo mật thông tin trong xét nghiệm ADN',
                                        image: '/blog5.jpg',
                                        desc: 'Tìm hiểu về các quy định và quy trình bảo mật thông tin cá nhân khi thực hiện xét nghiệm ADN tại bệnh viện.',
                                        slug: '5',
                                    },
                                    {
                                        title: 'So sánh các phương pháp xét nghiệm ADN hiện nay',
                                        image: '/blog6.jpg',
                                        desc: 'Đánh giá ưu nhược điểm của các công nghệ xét nghiệm ADN phổ biến, giúp bạn lựa chọn dịch vụ phù hợp.',
                                        slug: '6',
                                    },
                                ].map((article, idx) => (
                                    <article className="blog-card" key={idx}>
                                        <div className="blog-img-wrap">
                                            <img src={article.image} alt={article.title} className="blog-img" />
                                        </div>
                                        <div className="blog-content">
                                            <h3 className="blog-card-title">{article.title}</h3>
                                            <p className="blog-desc">{article.desc}</p>
                                            <Link to={`/blog/${article.slug}`} className="blog-btn">Đọc tiếp</Link>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </section>
                    </div>
                </section>
            </main>
            
            {/* Footer with Map */}
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

export default HomePage;

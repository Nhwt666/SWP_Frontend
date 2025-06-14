import React, { useEffect, useState } from 'react';
import '../styles/HomePage.css';

const images = ['/img1.jpg', '/img2.jpg', '/img3.jpg'];

const HomePage = () => {
    const [currentImage, setCurrentImage] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImage((prev) => (prev + 1) % images.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const goNext = () => setCurrentImage((prev) => (prev + 1) % images.length);
    const goPrev = () => setCurrentImage((prev) => (prev - 1 + images.length) % images.length);

    return (
        <>
            <section className="gallery">
                <div className="container">
                    <div className="slideshow fade-style">
                        {images.map((img, index) => (
                            <img
                                key={index}
                                src={img}
                                alt={`Slide ${index}`}
                                className={`slide ${index === currentImage ? 'active' : ''}`}
                            />
                        ))}
                        <button className="nav-btn left" onClick={goPrev}>❮</button>
                        <button className="nav-btn right" onClick={goNext}>❯</button>
                    </div>

                    <h2 className="section-title">Về Chúng Tôi</h2>
                    <p className="about-description">
                        Chúng tôi là đơn vị tiên phong trong lĩnh vực xét nghiệm ADN tại Việt Nam,
                        với đội ngũ chuyên gia nhiều năm kinh nghiệm và hệ thống thiết bị hiện đại đạt chuẩn quốc tế.<br /><br />
                        Trong suốt quá trình hoạt động, chúng tôi đã thực hiện hàng chục nghìn ca xét nghiệm chính xác và bảo mật,
                        hỗ trợ hiệu quả cho các nhu cầu như xác định huyết thống, pháp lý, di truyền và y tế.<br /><br />
                        Uy tín của chúng tôi được khẳng định qua sự tin tưởng từ khách hàng cá nhân, tổ chức và các cơ quan pháp luật.<br /><br />
                        Với sứ mệnh <strong>"Chính xác – Bảo mật – Nhanh chóng"</strong>,
                        chúng tôi cam kết mang đến dịch vụ xét nghiệm ADN đáng tin cậy nhất.
                    </p>
                </div>
            </section>

            <footer>
                <div className="container">
                    <p>&copy; 2025 Bệnh viện Xét nghiệm ADN. Mọi quyền được bảo lưu.</p>
                </div>
            </footer>
        </>
    );
};

export default HomePage;

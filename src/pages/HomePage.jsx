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

                    <div className="about-section">
                        <div className="about-left">
                            <img src="/nurse.png" alt="Nurse" />
                        </div>

                        <div className="about-right">
                            <div className="about-box">
                                Chúng tôi là đơn vị tiên phong trong lĩnh vực xét nghiệm ADN tại Việt Nam, với đội ngũ chuyên gia giàu kinh nghiệm.
                            </div>
                            <div className="about-box">
                                Hệ thống thiết bị hiện đại đạt chuẩn quốc tế, phục vụ các nhu cầu xét nghiệm huyết thống, pháp lý, y tế và di truyền.
                            </div>
                            <div className="about-box">
                                Uy tín được khẳng định qua hàng chục nghìn ca xét nghiệm chính xác và bảo mật, hỗ trợ cho cá nhân và cơ quan pháp luật.
                            </div>
                            <div className="about-box">
                                Sứ mệnh của chúng tôi là <strong>“Chính xác – Bảo mật – Nhanh chóng”</strong>, mang đến dịch vụ ADN đáng tin cậy nhất.
                            </div>
                        </div>
                    </div>

                </div>
            </section>
        </>
    );
};

export default HomePage;

import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import '../styles/HomePage.css';
import AboutSection from '../components/AboutSection';
import ExpertsSection from '../components/ExpertsSection';
import ProcessSection from '../components/ProcessSection';

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
                        <AboutSection />
                        <ExpertsSection />
                        <ProcessSection />  
                        {/* Blog Section removed */}
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

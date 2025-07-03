import React from "react";
import "./AboutSection.css";

const stats = [
  {
    icon: <svg width="40" height="40" fill="none" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4Z" fill="#2979ff"/></svg>,
    value: "500,000+",
    label: "Bệnh nhân tin tưởng"
  },
  {
    icon: <svg width="40" height="40" fill="none" viewBox="0 0 24 24"><path d="M19 19V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v12m14 0H5m14 0v2a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-2" stroke="#2979ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 17V9a3 3 0 1 1 6 0v8" stroke="#2979ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    value: "15",
    label: "Năm kinh nghiệm"
  },
  {
    icon: <svg width="40" height="40" fill="none" viewBox="0 0 24 24"><path d="M12 21c4.97 0 9-4.03 9-9s-4.03-9-9-9-9 4.03-9 9 4.03 9 9 9Zm0-4a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" fill="#2979ff"/></svg>,
    value: "98.9%",
    label: "Độ chính xác"
  },
  {
    icon: <svg width="40" height="40" fill="none" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8Zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6Z" fill="#2979ff"/></svg>,
    value: "25+",
    label: "Quốc gia phục vụ"
  }
];

export default function AboutSection() {
  return (
    <section className="about-section-bg">
      <div className="about-section-container">
        <h2 className="about-title">
          Về <span className="about-title-highlight">Trung Tâm Xét nghiệm ADN</span>
        </h2>
        <div className="about-desc">
          Tiên phong trong lĩnh vực xét nghiệm gen tại Việt Nam, chúng tôi cam kết mang đến những giải pháp y học cá nhân hóa chính xác và đáng tin cậy nhất.
        </div>
        <div className="about-mission-vision-row">
          <div className="about-mission">
            <div className="about-mission-icon">🎯</div>
            <div className="about-mission-title">Sứ mệnh</div>
            <div className="about-mission-desc">
              Cung cấp các dịch vụ xét nghiệm gen tiên tiến, chính xác và dễ tiếp cận, giúp mọi người hiểu rõ hơn về sức khỏe di truyền của mình để đưa ra những quyết định y tế thông minh và phòng ngừa bệnh tật hiệu quả.
            </div>
            <ul className="about-mission-list">
              <li>✔ Chính xác cao</li>
              <li>✔ Tư vấn chuyên sâu</li>
              <li>✔ Bảo mật tuyệt đối</li>
              <li>✔ Công nghệ tiên tiến</li>
            </ul>
          </div>
          <div className="about-vision">
            <div className="about-vision-icon">💙</div>
            <div className="about-vision-title">Tầm nhìn</div>
            <div className="about-vision-desc">
              Trở thành trung tâm xét nghiệm gen hàng đầu Đông Nam Á, góp phần xây dựng một tương lai y học cá nhân hóa, nơi mỗi người có thể kiểm soát và tối ưu hóa sức khỏe của mình thông qua thông tin di truyền.
            </div>
            <div className="about-vision-goal">
              <div className="about-vision-goal-title">Mục tiêu 2025</div>
              <div className="about-vision-goal-desc">Phục vụ 1 triệu bệnh nhân và mở rộng mạng lưới ra 10 quốc gia trong khu vực</div>
            </div>
          </div>
        </div>
        <div className="about-stats-row">
          {stats.map((stat, idx) => (
            <div className="about-stat-card" key={idx}>
              <div className="about-stat-icon">{stat.icon}</div>
              <div className="about-stat-value">{stat.value}</div>
              <div className="about-stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

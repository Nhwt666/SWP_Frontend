import React from "react";
import "./TestimonialsSection.css";

const testimonials = [
  {
    quote: "Thông tin sức khỏe di truyền đã giúp tôi xác định xu hướng mắc bệnh tim mạch của bệnh nhân sớm. Độ chính xác cấp độ lâm sàng và báo cáo chi tiết làm cho đây trở thành công cụ vô giá cho y học cá nhân hóa.",
    name: "Bác sĩ Sarah Chen",
    avatar: "BsSC",
    title: "Bác sĩ tim mạch",
    link: "Chuyên gia y tế",
    linkUrl: "#"
  },
  {
    quote: "Tìm hiểu về phản ứng di truyền của tôi với các loại bài tập khác nhau đã hoàn toàn thay đổi thói quen thể dục của tôi. Bây giờ tôi tập luyện thông minh hơn, không phải chăm chỉ hơn, và thấy kết quả tuyệt vời.",
    name: "Michael Rodriguez",
    avatar: "MR",
    title: "Người đam mê thể dục",
    link: "Sức khỏe & Sức sống",
    linkUrl: "#"
  },
  {
    quote: "Tôi đã khám phá ra mối liên hệ với các thành viên gia đình mà tôi chưa từng biết tồn tại và học được những chi tiết thú vị về mô hình di cư của tổ tiên. Thông tin về nguồn gốc rất chi tiết và chính xác.",
    name: "Jennifer Walsh",
    avatar: "JW",
    title: "Nhà nghiên cứu gia phả",
    link: "Khám phá nguồn gốc",
    linkUrl: "#"
  }
];

const stats = [
  {
    value: "4.9/5",
    label: "Đánh giá trung bình",
    stars: true
  },
  {
    value: "500K+",
    label: "Khách hàng hài lòng"
  },
  {
    value: "15K+",
    label: "Nhà cung cấp y tế"
  },
  {
    value: "99.9%",
    label: "Tỷ lệ chính xác"
  }
];

function Avatar({ initials }) {
  return (
    <div className="testimonial-avatar">
      {initials}
    </div>
  );
}

function TestimonialCard({ testimonial }) {
  return (
    <div className="testimonial-card">
      <div className="testimonial-quote-icon">&#10077;</div>
      <div className="testimonial-stars">
        {[...Array(5)].map((_, i) => (
          <span key={i} className="testimonial-star">★</span>
        ))}
      </div>
      <div className="testimonial-quote">"{testimonial.quote}"</div>
      <div className="testimonial-user">
        <Avatar initials={testimonial.avatar} />
        <div className="testimonial-user-info">
          <div className="testimonial-user-name">{testimonial.name}</div>
          <div className="testimonial-user-title">{testimonial.title}</div>
          <a className="testimonial-user-link" href={testimonial.linkUrl}>{testimonial.link}</a>
        </div>
      </div>
    </div>
  );
}

function StatsSection() {
  return (
    <div className="testimonials-stats-list">
      {stats.map((stat, idx) => (
        <div className="testimonials-stat-card" key={idx}>
          <div className="testimonials-stat-value">{stat.value}</div>
          <div className="testimonials-stat-label">{stat.label}</div>
          {stat.stars && (
            <div className="testimonials-stat-stars">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="testimonial-star">★</span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const TestimonialsSection = () => (
  <section className="testimonials-section-bg">
    <div className="testimonials-section-container">
      <h2 className="testimonials-title">
        Được tin tưởng bởi <span className="testimonials-title-highlight">các chuyên gia y tế</span>
      </h2>
      <div className="testimonials-desc">
        Tham gia cùng hàng nghìn khách hàng hài lòng đã khám phá ra những thông tin có giá trị về sức khỏe, nguồn gốc và cấu trúc di truyền của họ thông qua các dịch vụ xét nghiệm của chúng tôi.
      </div>
      <div className="testimonials-list">
        {testimonials.map((t, idx) => (
          <TestimonialCard testimonial={t} key={idx} />
        ))}
      </div>
      <StatsSection />
    </div>
  </section>
);

export default TestimonialsSection; 
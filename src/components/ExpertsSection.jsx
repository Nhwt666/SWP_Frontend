import React from "react";
import "./ExpertsSection.css";

const experts = [
  {
    name: "Dr. Nguyễn Hữu Thành",
    title: "Giám đốc Y khoa",
    subtitle: "Di truyền học phân tử",
    avatar: "👨‍⚕️",
    highlights: [
      "20+ năm kinh nghiệm",
      "300+ nghiên cứu công bố",
      "Chuyên gia hàng đầu Việt Nam",
    ],
  },
  {
    name: "Dr. Huỳnh Anh Nhựt",
    title: "Trưởng phòng Xét nghiệm",
    subtitle: "Sinh học phân tử",
    avatar: "👨‍⚕️",
    highlights: [
      "PhD Đại học Harvard",
      "Chuyên gia WHO",
      "15+ năm nghiên cứu",
    ],
  },
  {
    name: "Dr. Nguyễn Phước Thanh Phương",
    title: "Chuyên viên Di truyền",
    subtitle: "Tư vấn di truyền",
    avatar: "🧑‍🔬",
    highlights: [
      "Thạc sĩ Johns Hopkins",
      "1000+ ca tư vấn",
      "Chứng chỉ quốc tế",
    ],
  },
];

export default function ExpertsSection() {
  return (
    <section className="experts-section">
      <div className="experts-container">
        <h2 className="experts-title">
          Đội ngũ <span className="highlight">Chuyên gia</span>
        </h2>
        <p className="experts-desc">
          Những chuyên gia hàng đầu với nhiều năm kinh nghiệm trong lĩnh vực di truyền học và y học phân tử
        </p>
        <div className="experts-list">
          {experts.map((expert, idx) => (
            <div className="expert-card" key={idx}>
              <div className="expert-avatar">{expert.avatar}</div>
              <div className="expert-name">{expert.name}</div>
              <div className="expert-title">{expert.title}</div>
              <div className="expert-subtitle">{expert.subtitle}</div>
              <ul className="expert-highlights">
                {expert.highlights.map((h, i) => (
                  <li key={i}>⭐ {h}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 
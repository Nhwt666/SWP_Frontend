import React from "react";
import { CardContent } from "./ui/card";
import { Package, Beaker, BarChart3, FileText } from "lucide-react";
import "./ProcessSection.css";

const steps = [
  {
    icon: <Package size={36} />,
    title: "Đặt bộ kit",
    description: "Chọn gói xét nghiệm và nhận bộ thu thập DNA trong vòng 2-3 ngày làm việc.",
    details: [
      "Miễn phí vận chuyển toàn cầu",
      "Đóng gói an toàn",
      "Hướng dẫn rõ ràng"
    ]
  },
  {
    icon: <Beaker size={36} />,
    title: "Thu thập mẫu",
    description: "Thu thập nước bọt đơn giản chỉ mất 2 phút. Làm theo hướng dẫn từng bước dễ dàng của chúng tôi.",
    details: [
      "Không cần kim tiêm",
      "Quy trình không đau",
      "Ổn định ở nhiệt độ phòng"
    ]
  },
  {
    icon: <BarChart3 size={36} />,
    title: "Phân tích phòng thí nghiệm",
    description: "Phòng thí nghiệm hiện đại của chúng tôi phân tích DNA của bạn bằng công nghệ giải trình tự tiên tiến.",
    details: [
      "99.9% chính xác",
      "Thiết bị cấp độ lâm sàng",
      "Kiểm soát chất lượng nghiêm ngặt"
    ]
  },
  {
    icon: <FileText size={36} />,
    title: "Nhận kết quả",
    description: "Nhận báo cáo toàn diện với thông tin chi tiết và khuyến nghị có thể hành động.",
    details: [
      "Bảng điều khiển tương tác",
      "Giải thích chi tiết",
      "Cập nhật liên tục"
    ]
  }
];

const timeline = [
  {
    value: "2-3 ngày",
    label: "Giao kit",
    color: "blue"
  },
  {
    value: "24-48 giờ",
    label: "Xử lý phòng thí nghiệm",
    color: "green"
  },
  {
    value: "Trọn đời",
    label: "Truy cập báo cáo",
    color: "purple"
  }
];

export default function ProcessSection() {
  return (
    <section className="process-section-bg">
      <div className="process-section-container">
        <div className="process-section-title">
          <h2>
            Quy trình xét nghiệm
            <span className="process-section-highlight"> 4 bước đơn giản</span>
          </h2>
          <p>
            Việc lấy kết quả DNA của bạn dễ dàng hơn bao giờ hết. Từ đặt hàng đến nhận báo cáo toàn diện, toàn bộ quá trình chỉ mất vài ngày.
          </p>
        </div>
        <div className="process-steps-wrapper">
          <div className="process-steps-line"></div>
          {steps.map((step, idx) => (
            <div className="process-step-card" key={step.title}>
              <div className="process-step-number">{idx + 1}</div>
              <div className="process-step-icon">{step.icon}</div>
              <CardContent>
                <h3 className="process-step-title">{step.title}</h3>
                <p className="process-step-desc">{step.description}</p>
                <ul className="process-step-list">
                  {step.details.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </CardContent>
            </div>
          ))}
        </div>
        <div className="process-timeline">
          {timeline.map((item, idx) => (
            <div className={`process-timeline-item process-timeline-${item.color}`} key={item.value}>
              <div className="process-timeline-value">{item.value}</div>
              <div className="process-timeline-label">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 
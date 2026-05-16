import React from "react";
import { useNavigate } from "react-router-dom";

// 🎯 CẬP NHẬT: Nhận thêm thuộc tính showStatus với mặc định là false để bảo vệ các trang khác
const EventCard = ({ event, showStatus = false }) => {
  const navigate = useNavigate();

  // Hàm xử lý hiển thị ảnh: Ưu tiên ảnh thật -> Nếu không có dùng ảnh mẫu của web (Giữ nguyên gốc của Như)
  const getEventThumbnail = (eventData) => {
    if (eventData.image) {
      if (eventData.image.startsWith("http")) return eventData.image;

      const cleanPath = eventData.image.replace(/\\/g, "/");
      return `http://localhost:5000/${cleanPath}`;
    }

    return "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=600&auto=format&fit=crop";
  };

  const getShortAddress = (address) => {
    if (!address) return "Chưa cập nhật địa điểm";
    const parts = address.split(",");
    if (parts.length >= 3) {
      return `${parts[parts.length - 3].trim()}, ${parts[parts.length - 2].trim()}`;
    }
    return address;
  };

  const mainLocation = event.locations?.[0];

  return (
    <div className="event-card" onClick={() => navigate(`/event/${event._id}`)}>
      <div className="event-image-wrapper">
        <img
          src={getEventThumbnail(event)}
          alt={event.title}
          className="event-image"
          onError={(e) => {
            e.target.src =
              "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=600&auto=format&fit=crop";
          }}
        />
      </div>

      <div className="event-details">
        <h3 className="event-name">{event.title}</h3>

        <p className="event-location">
          <i className="fas fa-map-marker-alt"></i>
          {mainLocation?.address
            ? getShortAddress(mainLocation.address)
            : "Đang cập nhật..."}
        </p>

        <div className="event-meta">
          <span className="event-date">
            <i className="far fa-calendar-alt"></i>
            {event.startDate
              ? new Date(event.startDate).toLocaleDateString("vi-VN")
              : "Tùy lúc"}
          </span>
          <span className="event-price">
            {event.ticketPrice || "Miễn phí vào cổng"}
          </span>
        </div>

        {/* 🎯 ĐOẠN TỐI ƯU MỚI: Chỉ xuất hiện khi có lệnh bật công tắc showStatus từ trang Profile nộp qua */}
        {showStatus && event.status && (
          <div
            className="profile-status-bar"
            style={{
              marginTop: "12px",
              paddingTop: "10px",
              borderTop: "1px dashed #eee",
            }}
          >
            <span
              className={`status-badge-mini ${event.status}`}
              style={{
                fontSize: "12px",
                fontWeight: "600",
                padding: "4px 12px",
                borderRadius: "30px",
                display: "inline-block",
                background:
                  event.status === "approved"
                    ? "#d1fae5"
                    : event.status === "rejected"
                      ? "#fee2e2"
                      : "#f3e8ff",
                color:
                  event.status === "approved"
                    ? "#10b981"
                    : event.status === "rejected"
                      ? "#ef4444"
                      : "#a855f7",
              }}
            >
              {event.status === "approved"
                ? "🟢 Đã duyệt"
                : event.status === "rejected"
                  ? "🔴 Từ chối"
                  : "🟣 Chờ duyệt"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCard;

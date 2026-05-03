import React from "react";
import { useNavigate } from "react-router-dom";

const EventCard = ({ event }) => {
  const navigate = useNavigate();

  // Hàm xử lý hiển thị ảnh: Ưu tiên ảnh thật -> Nếu không có dùng ảnh mẫu của web
  const getEventThumbnail = (eventData) => {
    // 1. Kiểm tra nếu có ảnh từ database (do Như đóng góp qua form)
    if (eventData.image) {
      // Nếu là link web (http) thì dùng luôn, nếu là file local thì nối link server
      if (eventData.image.startsWith("http")) return eventData.image;

      const cleanPath = eventData.image.replace(/\\/g, "/");
      return `http://localhost:5000/${cleanPath}`;
    }

    // 2. Nếu không có ảnh thật, trả về ảnh mẫu của EviGo (Dùng ảnh minh họa chuyên nghiệp)
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
          // Xử lý nếu link ảnh thật bị lỗi thì quay về ảnh mẫu ngay lập tức
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
      </div>
    </div>
  );
};

export default EventCard;

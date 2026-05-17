import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const EventCard = ({ event }) => {
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);

  // State quản lý hiệu ứng Hover mượt mà bằng JavaScript cho từng nút
  const [isHoverHeart, setIsHoverHeart] = useState(false);
  const [isHoverMap, setIsHoverMap] = useState(false);

  const getValidToken = () => {
    return localStorage.getItem("token") || localStorage.getItem("Token") || "";
  };

  useEffect(() => {
    const checkSavedStatus = async () => {
      try {
        const token = getValidToken();
        if (!token) return;

        const response = await axios.get(
          "http://localhost:5000/api/events/saved-events-ids",
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const savedIds = response.data || [];
        setIsSaved(savedIds.includes(event._id));
      } catch (err) {
        console.error("Lỗi đồng bộ trạng thái lưu:", err.message);
      }
    };
    checkSavedStatus();
  }, [event._id]);

  const handleHeartClick = async (e) => {
    e.stopPropagation();
    try {
      const token = getValidToken();
      if (!token) {
        toast.error("Vui lòng đăng nhập để lưu sự kiện! 🔒");
        return;
      }

      const response = await axios.post(
        `http://localhost:5000/api/events/save-event/${event._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data.isSaved) {
        setIsSaved(true);
        toast.success("Đã thêm vào danh sách yêu thích! ❤️");
      } else {
        setIsSaved(false);
        toast.success("Đã xóa khỏi danh sách lưu!");
      }
    } catch (err) {
      console.error("Lỗi nút thích:", err.message);
    }
  };

  // 🎯 CẬP NHẬT QUAN TRỌNG: Đính kèm eventId vào gói state gửi sang hệ thống WebGIS
  const handleMapLocationClick = (e) => {
    e.stopPropagation(); // Chặn lan truyền ngược lên thẻ div cha
    const firstLoc = event.locations?.[0];
    if (firstLoc && firstLoc.lat && firstLoc.lng) {
      navigate("/map", {
        state: {
          lat: Number(firstLoc.lat),
          lng: Number(firstLoc.lng),
          keyword: event.title,
          eventId: event._id, // <-- Đóng gói ID sự kiện gửi đi
        },
      });
    } else {
      navigate("/map");
    }
  };

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

  // 🎯 BỘ CSS INLINE LỰC CHIẾN: Đè bẹp hoàn toàn lề xám mặc định của trình duyệt
  const inlineStyles = {
    actionsWrapper: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      width: "100%",
      marginTop: "12px",
      boxSizing: "border-box",
    },
    btnBase: {
      width: "100%",
      padding: "11px 16px",
      border: "none",
      outline: "none",
      borderRadius: "10px",
      fontSize: "13.5px",
      fontWeight: "700",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      boxSizing: "border-box",
      color: "#ffffff",
      transition: "all 0.2s ease",
    },
    btnHeart: {
      backgroundColor: isHoverHeart
        ? "#be123c"
        : isSaved
          ? "#dc2626"
          : "#e11d48",
      boxShadow: isSaved ? "0 4px 12px rgba(225, 29, 72, 0.3)" : "none",
    },
    btnMap: {
      backgroundColor: isHoverMap ? "#4f46e5" : "#635bff",
      boxShadow: isHoverMap ? "0 4px 12px rgba(99, 91, 255, 0.25)" : "none",
    },
  };

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
          <i
            className="fas fa-map-marker-alt"
            style={{ marginRight: "6px" }}
          ></i>
          {mainLocation?.address
            ? getShortAddress(mainLocation.address)
            : "Đang cập nhật..."}
        </p>

        <div className="event-meta">
          <span className="event-date">
            <i
              className="far fa-calendar-alt"
              style={{ marginRight: "6px" }}
            ></i>
            {event.startDate
              ? new Date(event.startDate).toLocaleDateString("vi-VN")
              : "Tùy lúc"}
          </span>
          <span className="event-price">{event.ticketPrice || "Miễn phí"}</span>
        </div>

        {/* 🎯 ÁP DỤNG INLINE STYLES: Đảm bảo giao diện đồng bộ tuyệt đối bất kể cache file CSS */}
        <div style={inlineStyles.actionsWrapper}>
          <button
            style={{ ...inlineStyles.btnBase, ...inlineStyles.btnHeart }}
            onClick={handleHeartClick}
            onMouseEnter={() => setIsHoverHeart(true)}
            onMouseLeave={() => setIsHoverHeart(false)}
          >
            <i className={isSaved ? "fas fa-heart" : "far fa-heart"}></i>
            <span>{isSaved ? "Đã thích" : "Yêu thích"}</span>
          </button>

          <button
            style={{ ...inlineStyles.btnBase, ...inlineStyles.btnMap }}
            onClick={handleMapLocationClick}
            onMouseEnter={() => setIsHoverMap(true)}
            onMouseLeave={() => setIsHoverMap(false)}
          >
            <i className="fas fa-map-marker-alt"></i>
            <span>Xem trên bản đồ</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;

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

        const response = await axios.get("/api/events/saved-events-ids", {
          headers: { Authorization: `Bearer ${token}` },
        });
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
        `/api/events/save-event/${event._id}`,
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

  const handleMapLocationClick = (e) => {
    e.stopPropagation();
    const firstLoc = event.locations?.[0];
    if (firstLoc && firstLoc.lat && firstLoc.lng) {
      navigate("/map", {
        state: {
          lat: Number(firstLoc.lat),
          lng: Number(firstLoc.lng),
          keyword: event.title,
          eventId: event._id,
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
      return `/${cleanPath}`;
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

  const inlineStyles = {
    cardWrapper: {
      background: "#ffffff",
      borderRadius: "20px",
      border: "1.5px solid #635bff",
      overflow: "hidden",
      cursor: "pointer",
      transition: "all 0.3s ease",
      width: "100%",
      height: "430px",
      display: "flex",
      flexDirection: "column",
      boxSizing: "border-box",
    },
    imageWrapper: {
      width: "100%",
      height: "180px",
      overflow: "hidden",
      flexShrink: 0,
    },
    imageContent: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
    },
    cardBody: {
      padding: "18px",
      flexGrow: 1,
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-start",
      boxSizing: "border-box",
      overflow: "hidden",
    },
    eventName: {
      fontSize: "16px",
      fontWeight: "700",
      color: "#2d2d2d",
      margin: "0 0 8px 0",
      lineHeight: "1.4",
      height: "2.8em",
      display: "-webkit-box",
      WebkitLineClamp: 2,
      WebkitBoxOrient: "vertical",
      overflow: "hidden",
    },
    eventLocation: {
      fontSize: "13.5px",
      color: "#888",
      margin: "0 0 0px 0",
      lineHeight: "1.4",
      height: "1.4em",
      display: "-webkit-box",
      WebkitLineClamp: 1,
      WebkitBoxOrient: "vertical",
      overflow: "hidden",
      textOverflow: "ellipsis",
      borderBottom: "1px solid #eeeeee",
      paddingBottom: "12px",
      boxSizing: "content-box",
    },
    eventMetaRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      fontSize: "13px",
      fontWeight: "600",
      paddingTop: "12px",
      boxSizing: "border-box",
    },
    eventDate: {
      color: "#777",
    },
    eventPrice: {
      color: "#635bff",
      fontWeight: "700",
    },
    actionsWrapper: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      width: "100%",
      marginTop: "auto",
      boxSizing: "border-box",
      paddingTop: "12px",
    },
    btnBase: {
      width: "100%",
      padding: "11px 16px",
      border: "none",
      outline: "none",
      borderRadius: "12px",
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
    <div
      style={inlineStyles.cardWrapper}
      onClick={() => navigate(`/event/${event._id}`)}
    >
      <div style={inlineStyles.imageWrapper}>
        <img
          src={getEventThumbnail(event)}
          alt={event.title}
          style={inlineStyles.imageContent}
          onError={(e) => {
            e.target.src =
              "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=600&auto=format&fit=crop";
          }}
        />
      </div>

      <div style={inlineStyles.cardBody}>
        <h3 style={inlineStyles.eventName}>{event.title}</h3>

        <p style={inlineStyles.eventLocation}>
          <i
            className="fas fa-map-marker-alt"
            style={{ marginRight: "6px", color: "#635bff" }}
          ></i>
          {mainLocation?.address
            ? getShortAddress(mainLocation.address)
            : "Đang cập nhật..."}
        </p>

        <div style={inlineStyles.eventMetaRow}>
          <span style={inlineStyles.eventDate}>
            <i
              className="far fa-calendar-alt"
              style={{ marginRight: "6px" }}
            ></i>
            {event.startDate
              ? new Date(event.startDate).toLocaleDateString("vi-VN")
              : "Tùy lúc"}
          </span>
          <span style={inlineStyles.eventPrice}>
            {event.ticketPrice || "Miễn phí"}
          </span>
        </div>

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

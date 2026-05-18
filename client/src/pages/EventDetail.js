import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import axiosInstance from "axios";
import toast from "react-hot-toast";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./EventDetail.css";
import iconCalendar from "../assets/eventdetail/1.png";
import iconTicket from "../assets/eventdetail/2.png";
import iconVerified from "../assets/eventdetail/3.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savedEventIds, setSavedEventIds] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(5);

  const dayNames = [
    "Chủ Nhật",
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
  ];

  const getValidToken = useCallback(() => {
    return localStorage.getItem("token") || localStorage.getItem("Token") || "";
  }, []);

  const getFullImageUrl = (path) => {
    if (!path) return "/default-banner.jpg";
    if (path.startsWith("http")) return path;
    let cleanPath = path.replace(/\\/g, "/");
    if (cleanPath.startsWith("server/"))
      cleanPath = cleanPath.replace("server/", "");
    if (cleanPath.startsWith("uploads/"))
      return `http://localhost:5000/${cleanPath}`;
    return `http://localhost:5000/uploads/${cleanPath}`;
  };

  const fetchSavedEventIds = useCallback(async () => {
    try {
      const token = getValidToken();
      if (!token) return;

      const response = await axiosInstance.get(
        "http://localhost:5000/api/events/saved-events-ids",
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setSavedEventIds(response.data || []);
    } catch (err) {
      console.error("Lỗi đồng bộ danh sách đã lưu ở chi tiết:", err.message);
    }
  }, [getValidToken]);

  const fetchEventComments = useCallback(async () => {
    try {
      const response = await axiosInstance.get(
        `http://localhost:5000/api/comments/event/${id}`,
      );
      setComments(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Lỗi nạp bình luận:", err.message);
    }
  }, [id]);

  const handleToggleSaveEvent = async (eventId) => {
    try {
      const token = getValidToken();
      if (!token) {
        toast.error("Vui lòng đăng nhập để sử dụng tính năng lưu này! 🔒");
        return;
      }

      const response = await axiosInstance.post(
        `http://localhost:5000/api/events/save-event/${eventId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data.isSaved) {
        setSavedEventIds((prev) => [...prev, eventId]);
        toast.success("Đã thêm vào danh sách yêu thích! ❤️");
      } else {
        setSavedEventIds((prev) => prev.filter((id) => id !== eventId));
        toast.success("Đã xóa khỏi danh sách lưu!");
      }
    } catch (err) {
      console.error("Lỗi thao tác lưu bài:", err.message);
      toast.error("Thao tác lưu thất bại, vui lòng thử lại!");
    }
  };

  const handleShareEventLink = () => {
    const currentUrl = window.location.href;
    navigator.clipboard
      .writeText(currentUrl)
      .then(() => {
        toast.success(
          "Đã sao chép liên kết sự kiện! Chia sẻ cho bạn bè liền nhen 🔗✨",
        );
      })
      .catch((err) => {
        console.error("Lỗi sao chép URL bài viết:", err);
        toast.error(
          "Không thể tự copy, em hãy sao chép trên thanh địa chỉ trình duyệt nhé!",
        );
      });
  };

  const handleOpenGoogleDirections = () => {
    const firstLoc = event?.locations?.[0];
    if (!firstLoc || !firstLoc.lat || !firstLoc.lng) {
      toast.error("Không tìm thấy tọa độ GIS của địa điểm này!");
      return;
    }

    toast.loading("Đang kết nối định vị vệ tinh GPS... 🛰️", {
      id: "geo-toast",
    });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const startLat = position.coords.latitude;
          const startLng = position.coords.longitude;
          toast.dismiss("geo-toast");

          const url = `https://www.google.com/maps/dir/?api=1&origin=${startLat},${startLng}&destination=${firstLoc.lat},${firstLoc.lng}&travelmode=driving`;
          window.open(url, "_blank");
        },
        (error) => {
          console.warn("Không lấy được GPS tự động:", error.message);
          toast.dismiss("geo-toast");
          toast.error(
            "Đã chặn quyền GPS, hãy tự nhập điểm đi trên Google Maps nhé! 🗺️",
            { duration: 4000 },
          );

          const url = `https://www.google.com/maps/dir/?api=1&destination=${firstLoc.lat},${firstLoc.lng}&travelmode=driving`;
          window.open(url, "_blank");
        },
      );
    } else {
      toast.dismiss("geo-toast");
      const url = `https://www.google.com/maps/dir/?api=1&destination=${firstLoc.lat},${firstLoc.lng}&travelmode=driving`;
      window.open(url, "_blank");
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      toast.error("Evier ơi, nhập nội dung đánh giá trước nha! 🌸");
      return;
    }

    try {
      const token = getValidToken();
      if (!token) {
        toast.error("Vui lòng đăng nhập để bình luận! 🔒");
        return;
      }

      const response = await axiosInstance.post(
        "http://localhost:5000/api/comments/add",
        {
          eventId: id,
          content: newComment,
          rating: Number(rating),
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      toast.success("Đã đăng tải đánh giá thành công! ✨");

      const addedComment = response.data?.comment || response.data;
      if (addedComment) {
        setComments((prev) => {
          const safeList = Array.isArray(prev) ? prev : [];
          const nextComments = [addedComment, ...safeList];

          const nextTotalReviews = nextComments.length;
          const sum = nextComments.reduce(
            (acc, cur) => acc + (Number(cur.rating) || 5),
            0,
          );
          const nextAverageRating =
            Math.round((sum / nextTotalReviews) * 10) / 10;

          setEvent((prevEvent) => ({
            ...prevEvent,
            averageRating: nextAverageRating,
            totalReviews: nextTotalReviews,
          }));

          return nextComments;
        });
      }

      setNewComment("");
      setRating(5);

      setTimeout(async () => {
        try {
          const res = await axiosInstance.get(
            `http://localhost:5000/api/events/${id}`,
          );
          if (res.data && res.data.totalReviews > 0) {
            setEvent(res.data);
          }
        } catch (fetchErr) {
          console.error("Lỗi đồng bộ ngầm dự phòng:", fetchErr.message);
        }
      }, 600);
    } catch (err) {
      console.error("Lỗi đăng bình luận:", err.message);
      toast.error(err.response?.data?.message || "Gửi bình luận thất bại rồi!");
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchDetail = async () => {
      try {
        const res = await axiosInstance.get(
          `http://localhost:5000/api/events/${id}`,
        );
        setEvent(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Lỗi lấy dữ liệu chi tiết:", err);
        setLoading(false);
      }
    };

    fetchDetail();
    fetchSavedEventIds();
    fetchEventComments();
  }, [id, fetchSavedEventIds, fetchEventComments]);

  if (loading)
    return <div className="ed-loading">Đang tải thông tin EviGo...</div>;
  if (!event)
    return (
      <div className="ed-error">Không tìm thấy sự kiện này rồi!</div>
    );

  const mainBanner = getFullImageUrl(
    event.image || (event.images && event.images[0]),
  );

  const isCurrentEventSaved = savedEventIds.includes(event._id);

  const mapPosition =
    event.locations && event.locations[0]
      ? [parseFloat(event.locations[0].lat), parseFloat(event.locations[0].lng)]
      : [10.7719, 106.6983];

  const iconImageStyle = {
    width: "44px",
    height: "44px",
    objectFit: "contain",
    borderRadius: "10px",
  };

  return (
    <div className="ed-wrapper">
      <header className="ed-hero">
        <img src={mainBanner} alt="Banner" className="ed-hero-img" />
        <div className="ed-hero-overlay">
          <div className="ed-container">
            <button className="ed-btn-back" onClick={() => navigate(-1)}>
              Quay lại
            </button>

            <div className="ed-hero-content">
              <div className="ed-badge-wrapper">
                <span className="ed-badge">{event.type}</span>
              </div>

              <div className="ed-title-action-row">
                <h1 className="ed-main-title">{event.title}</h1>
              </div>

              <p className="ed-hero-loc">
                📍{" "}
                {event.locations && event.locations[0]?.detailAddress
                  ? `[${event.locations[0].detailAddress}] `
                  : ""}
                {event.locations && event.locations[0]?.address}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="ed-container ed-main-grid">
        <div className="ed-content-left">
          <section className="ed-card">
            <h2 className="ed-section-title">Giới thiệu sự kiện</h2>
            <p className="ed-desc" style={{ whiteSpace: "pre-line" }}>
              {event.description}
            </p>
          </section>

          {event.images && event.images.length > 0 && (
            <section className="ed-card">
              <h2 className="ed-section-title">Album hình ảnh</h2>
              <div className="ed-gallery-grid">
                {event.images.map((img, index) => (
                  <div key={index} className="ed-gallery-item">
                    <img
                      src={getFullImageUrl(img)}
                      alt={`img-${index}`}
                      className="ed-gallery-img-content"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="ed-card">
            <h2 className="ed-section-title">Các địa điểm diễn ra</h2>
            <div className="ed-location-list" style={{ marginBottom: "15px" }}>
              {event.locations?.map((loc, index) => (
                <div
                  key={index}
                  className="ed-loc-item"
                  style={{
                    padding: "12px",
                    borderBottom: "1px solid #eee",
                    marginBottom: "8px",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 6px 0",
                      fontSize: "14.5px",
                      lineHeight: "1.5",
                    }}
                  >
                    <strong>Địa điểm {index + 1}:</strong>{" "}
                    {loc.detailAddress && (
                      <span style={{ color: "#635bff", fontWeight: "700" }}>
                        {loc.detailAddress}{" "}
                      </span>
                    )}
                    <span style={{ color: "#4b5563" }}>— {loc.address}</span>
                  </p>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <small
                      className="ed-gis-text"
                      style={{ color: "#00bfa5", fontWeight: "600" }}
                    >
                      🌐 GIS: {loc.lat}, {loc.lng}{" "}
                      {loc.district ? `- ${loc.district}` : ""}
                    </small>
                  </div>
                </div>
              ))}
            </div>

            <div
              className="ed-detail-map-box"
              style={{
                width: "100%",
                height: "260px",
                borderRadius: "14px",
                overflow: "hidden",
                border: "1px solid #d1d1f0",
              }}
            >
              <MapContainer
                center={mapPosition}
                zoom={15}
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom={false}
              >
                <TileLayer
                  attribution="© Google Maps"
                  url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=vi"
                />
                <Marker position={mapPosition}>
                  <Popup>
                    <strong>{event.title}</strong>
                    <br />
                    {event.locations?.[0]?.detailAddress
                      ? `[${event.locations[0].detailAddress}] `
                      : ""}
                    {event.locations?.[0]?.address}
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </section>

          <section className="ed-card ed-comments-section">
            <h2 className="ed-section-title">Bình luận & Đánh giá</h2>

            <form onSubmit={handleCommentSubmit} className="ed-comment-form">
              <div
                className="ed-rating-picker"
                style={{
                  marginBottom: "10px",
                  fontSize: "14px",
                  fontWeight: "700",
                  color: "#280d8c",
                }}
              >
                <label style={{ marginRight: "10px" }}>
                  Evier đánh giá sự kiện này mấy sao:
                </label>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  style={{
                    padding: "6px",
                    borderRadius: "8px",
                    border: "1.5px solid #d1d1f0",
                    fontWeight: "600",
                    outline: "none",
                  }}
                >
                  <option value="5">⭐⭐⭐⭐⭐ (5 sao)</option>
                  <option value="4">⭐⭐⭐⭐ (4 sao)</option>
                  <option value="3">⭐⭐⭐ (3 sao)</option>
                  <option value="2">⭐⭐ (2 sao)</option>
                  <option value="1">⭐ (1 sao)</option>
                </select>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <textarea
                  placeholder="Evier ơi, hãy chia sẻ cảm nghĩ của bạn về sự kiện này để cộng đồng cùng biết nhé..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows="3"
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "12px",
                    border: "1.5px solid #d1d1f0",
                    resize: "none",
                    boxSizing: "border-box",
                    outline: "none",
                  }}
                ></textarea>
                <button
                  type="submit"
                  style={{
                    alignSelf: "flex-end",
                    padding: "8px 16px",
                    backgroundColor: "#635bff",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  Gửi phản hồi ✨
                </button>
              </div>
            </form>

            <div
              className="ed-comments-list"
              style={{
                marginTop: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "15px",
              }}
            >
              {comments.length > 0 ? (
                comments.map((item) => {
                  const finalAccountName =
                    item.userStringName &&
                    item.userStringName !== "Người dùng EviGo" &&
                    item.userStringName !== "User EviGo"
                      ? item.userStringName
                      : (item.user?.email && item.user.email.includes("@")
                          ? item.user.email.split("@")[0]
                          : null) ||
                        item.user?.username ||
                        item.user?.name ||
                        item.user?.displayName ||
                        "User EviGo";

                  const avatarLetters = finalAccountName
                    .substring(0, 2)
                    .toUpperCase();

                  return (
                    <div
                      key={item._id}
                      style={{
                        display: "flex",
                        gap: "15px",
                        padding: "15px",
                        backgroundColor: "#f9fafb",
                        borderRadius: "16px",
                        border: "1px solid #e5e7eb",
                      }}
                    >
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          backgroundColor: "#e0dbff",
                          color: "#635bff",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "800",
                          fontSize: "13px",
                        }}
                      >
                        {avatarLetters}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "4px",
                          }}
                        >
                          <strong
                            style={{ fontSize: "14px", color: "#1f2937" }}
                          >
                            {finalAccountName}
                          </strong>
                          <span
                            style={{
                              fontSize: "13px",
                              fontWeight: "700",
                              color: "#f59e0b",
                            }}
                          >
                            {item.rating}/5 ★
                          </span>
                        </div>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "13.5px",
                            color: "#4b5563",
                            lineHeight: "1.4",
                            whiteSpace: "pre-line",
                          }}
                        >
                          {item.content}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p
                  style={{
                    textAlign: "center",
                    color: "#888",
                    fontSize: "13.5px",
                    fontStyle: "italic",
                    padding: "10px",
                  }}
                >
                  Chưa có đánh giá nào. Hãy là người đầu tiên bình luận nhé!
                  🌸
                </p>
              )}
            </div>
          </section>
        </div>

        <aside className="ed-sidebar">
          <div className="ed-sticky-card">
            <div
              className="ed-rating-summary-box"
              style={{
                padding: "16px",
                backgroundColor: "#f9f8ff",
                borderRadius: "14px",
                border: "1.5px dashed #cbd5e1",
                marginBottom: "16px",
              }}
            >
              <h4
                style={{
                  margin: "0 0 10px 0",
                  color: "#280d8c",
                  fontSize: "14.5px",
                  fontWeight: "800",
                }}
              >
                ⭐ Đánh giá từ cộng đồng
              </h4>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "5px",
                  marginBottom: "4px",
                }}
              >
                <span
                  style={{
                    fontSize: "26px",
                    fontWeight: "900",
                    color: "#1f2937",
                  }}
                >
                  {event.averageRating !== undefined &&
                  event.averageRating !== null
                    ? event.averageRating
                    : "5.0"}
                </span>
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "700",
                    color: "#f59e0b",
                  }}
                >
                  ★
                </span>
                <span
                  style={{
                    fontSize: "13px",
                    color: "#6b7280",
                    fontWeight: "600",
                    marginLeft: "4px",
                  }}
                >
                  ({event.totalReviews || 0} đánh giá)
                </span>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: "12px",
                  color: "#635bff",
                  fontWeight: "700",
                }}
              >
                📍 Ho Chi Minh City, VN
              </p>
            </div>

            <div className="ed-sidebar-item">
              <div className="ed-icon-box" style={{ background: "none" }}>
                <img
                  src={iconCalendar}
                  alt="Lịch trình"
                  style={iconImageStyle}
                />
              </div>
              <div className="ed-text-box">
                <small>Lịch trình</small>
                {event.isPermanent ? (
                  <p className="ed-status-open">Mở cửa cố định hằng tuần</p>
                ) : (
                  <p>
                    {new Date(event.startDate).toLocaleDateString("vi-VN")} -{" "}
                    {new Date(event.endDate).toLocaleDateString("vi-VN")}
                  </p>
                )}
                <span>
                  {event.isAllDay
                    ? "🕛 Mở cửa cả ngày (24/24)"
                    : `⏰ ${event.dailyOpeningTime} - ${event.dailyClosingTime}`}
                </span>
                {event.isPermanent && event.closedDays?.length > 0 && (
                  <div
                    className="ed-closed-days"
                    style={{ color: "#ff4d4f", fontWeight: "600" }}
                  >
                    ❌ Nghỉ:{" "}
                    {event.closedDays.map((d) => dayNames[d]).join(", ")}
                  </div>
                )}
              </div>
            </div>

            <div className="ed-sidebar-item">
              <div className="ed-icon-box" style={{ background: "none" }}>
                <img src={iconTicket} alt="Giá vé" style={iconImageStyle} />
              </div>
              <div className="ed-text-box">
                <small>Giá vé</small>
                <p
                  className="ed-price"
                  style={{ color: "#10b981", fontWeight: "700" }}
                >
                  {event.ticketPrice || "Miễn phí"}
                </p>
              </div>
            </div>

            <div className="ed-sidebar-item">
              <div className="ed-icon-box" style={{ background: "none" }}>
                <img
                  src={iconVerified}
                  alt="Người cung cấp"
                  style={iconImageStyle}
                />
              </div>
              <div className="ed-text-box">
                <small>Cung cấp bởi</small>
                <p style={{ fontWeight: "600" }}>
                  {event.contributor?.displayName ||
                    event.contributor?.name ||
                    "Cộng đồng EviGo"}
                </p>
                <span
                  className="ed-verified"
                  style={{ color: "#635bff", fontWeight: "700" }}
                >
                  ✨ Đã xác thực
                </span>
              </div>
            </div>

            <button
              className={`ed-btn-save-large ${isCurrentEventSaved ? "is-saved" : ""}`}
              onClick={() => handleToggleSaveEvent(event._id)}
              style={{ marginBottom: "10px" }}
            >
              {isCurrentEventSaved ? "Đã yêu thích ❤️" : "Lưu sự kiện 🤍"}
            </button>

            <button
              type="button"
              className="ed-btn-share-link"
              onClick={handleShareEventLink}
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#f0f0f5",
                color: "#280d8c",
                border: "1.5px solid #280d8c",
                borderRadius: "12px",
                fontWeight: "700",
                cursor: "pointer",
                marginBottom: "10px",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                transition: "all 0.2s ease",
              }}
            >
              Chia sẻ sự kiện này 🔗
            </button>

            <button
              className="ed-btn-primary"
              onClick={handleOpenGoogleDirections}
            >
              🚀 Chỉ đường chi tiết
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./EventDetail.css";

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  const dayNames = [
    "Chủ Nhật",
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
  ];

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

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchDetail = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/events/${id}`);
        setEvent(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Lỗi lấy dữ liệu:", err);
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading)
    return <div className="ed-loading">Đang tải thông tin EviGo...</div>;
  if (!event)
    return (
      <div className="ed-error">Không tìm thấy sự kiện này rồi Như ơi!</div>
    );

  const mainBanner = getFullImageUrl(
    event.image || (event.images && event.images[0]),
  );

  return (
    <div className="ed-wrapper">
      <header className="ed-hero">
        <img src={mainBanner} alt="Banner" className="ed-hero-img" />
        <div className="ed-hero-overlay">
          <div className="ed-container">
            {/* NÚT QUAY LẠI THÔNG MINH */}
            <button className="ed-btn-back" onClick={() => navigate(-1)}>
              Quay lại
            </button>

            <div className="ed-hero-content">
              {/* Badge thể loại hiện phía trên tiêu đề */}
              <div className="ed-badge-wrapper">
                <span className="ed-badge">{event.type}</span>
              </div>

              <h1 className="ed-main-title">{event.title}</h1>

              <p className="ed-hero-loc">
                📍 {event.locations && event.locations[0]?.address}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="ed-container ed-main-grid">
        <div className="ed-content-left">
          <section className="ed-card">
            <h2 className="ed-section-title">Giới thiệu sự kiện</h2>
            <p className="ed-desc">{event.description}</p>
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
            <div className="ed-location-list">
              {event.locations?.map((loc, index) => (
                <div key={index} className="ed-loc-item">
                  <p>
                    <strong>Địa điểm {index + 1}:</strong> {loc.address}
                  </p>
                  <small className="ed-gis-text">
                    GIS: {loc.lat}, {loc.lng} - {loc.district}
                  </small>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="ed-sidebar">
          <div className="ed-sticky-card">
            <div className="ed-sidebar-item">
              <div className="ed-icon-box">
                <i className="far fa-calendar-alt"></i>
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
                  <div className="ed-closed-days">
                    ❌ Nghỉ:{" "}
                    {event.closedDays.map((d) => dayNames[d]).join(", ")}
                  </div>
                )}
              </div>
            </div>

            <div className="ed-sidebar-item">
              <div className="ed-icon-box">
                <i className="fas fa-ticket-alt"></i>
              </div>
              <div className="ed-text-box">
                <small>Giá vé</small>
                <p className="ed-price">{event.ticketPrice || "Miễn phí"}</p>
              </div>
            </div>

            <div className="ed-sidebar-item">
              <div className="ed-icon-box">
                <i className="fas fa-user-edit"></i>
              </div>
              <div className="ed-text-box">
                <small>Cung cấp bởi</small>
                <p>
                  {event.contributor?.displayName ||
                    event.contributor?.name ||
                    "Cộng đồng EviGo"}
                </p>
                <span className="ed-verified">
                  <i className="fas fa-check-circle"></i> Đã xác thực
                </span>
              </div>
            </div>
            <button className="ed-btn-primary">Lên lịch đi ngay!</button>
          </div>
        </aside>
      </main>
    </div>
  );
}

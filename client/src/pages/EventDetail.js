import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./EventDetail.css";

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mảng tên các thứ trong tuần để hiển thị ngày nghỉ
  const dayNames = [
    "Chủ Nhật",
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
  ];

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

  return (
    <div className="ed-wrapper">
      {/* 1. Hero Banner - Lấy ảnh đầu tiên trong mảng images làm Banner */}
      <header className="ed-hero">
        <img
          src={
            (event.images && event.images[0]) ||
            event.image ||
            "/default-banner.jpg"
          }
          alt="Banner"
          className="ed-hero-img"
        />
        <div className="ed-hero-overlay">
          <div className="ed-container">
            <button className="ed-btn-back" onClick={() => navigate("/")}>
              <i className="fas fa-chevron-left"></i> Quay lại
            </button>
            <div className="ed-hero-content">
              <span className="ed-badge">{event.type}</span>
              <h1 className="ed-main-title">{event.title}</h1>
              <p className="ed-hero-loc">
                📍 {event.locations && event.locations[0]?.address}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="ed-container ed-main-grid">
        {/* CỘT TRÁI */}
        <div className="ed-content-left">
          {/* Giới thiệu */}
          <section className="ed-card">
            <h2 className="ed-section-title">Giới thiệu sự kiện</h2>
            <p className="ed-desc">{event.description}</p>
          </section>

          {/* Album ảnh (Nếu có nhiều ảnh từ đóng góp) */}
          {event.images && event.images.length > 1 && (
            <section className="ed-card">
              <h2 className="ed-section-title">Album hình ảnh</h2>
              <div
                className="ed-gallery-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                  gap: "10px",
                  marginTop: "15px",
                }}
              >
                {event.images.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`img-${index}`}
                    style={{
                      width: "100%",
                      height: "120px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Danh sách địa điểm (Hỗ trợ đa địa điểm) */}
          <section className="ed-card">
            <h2 className="ed-section-title">Các địa điểm diễn ra</h2>
            <div className="ed-location-list">
              {event.locations?.map((loc, index) => (
                <div
                  key={index}
                  className="ed-loc-item"
                  style={{
                    marginBottom: "15px",
                    padding: "10px",
                    borderLeft: "4px solid #635bff",
                    background: "#f9f9f9",
                  }}
                >
                  <p>
                    <strong>Địa điểm {index + 1}:</strong> {loc.address}
                  </p>
                  <small style={{ color: "#666" }}>
                    Tọa độ GIS: {loc.lat}, {loc.lng}
                  </small>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* CỘT PHẢI (SIDEBAR) */}
        <aside className="ed-sidebar">
          <div className="ed-sticky-card">
            {/* Logic Thời gian mới */}
            <div className="ed-sidebar-item">
              <div className="ed-icon-box">
                <i className="far fa-calendar-alt"></i>
              </div>
              <div className="ed-text-box">
                <small>Lịch trình</small>
                {event.isPermanent ? (
                  <p style={{ color: "#28a745", fontWeight: "bold" }}>
                    Mở cửa cố định hằng tuần
                  </p>
                ) : (
                  <p>
                    {new Date(event.startDate).toLocaleDateString("vi-VN")} -{" "}
                    {new Date(event.endDate).toLocaleDateString("vi-VN")}
                  </p>
                )}

                {/* Hiển thị giờ hoặc nhãn Cả ngày */}
                <span>
                  {event.isAllDay
                    ? "🕛 Mở cửa cả ngày (24/24)"
                    : `⏰ ${event.dailyOpeningTime} - ${event.dailyClosingTime}`}
                </span>

                {/* Hiển thị ngày nghỉ nếu có */}
                {event.isPermanent && event.closedDays?.length > 0 && (
                  <div
                    style={{
                      marginTop: "5px",
                      fontSize: "12px",
                      color: "#ff4d4d",
                    }}
                  >
                    ❌ Nghỉ:{" "}
                    {event.closedDays
                      .map((d) => dayNames[dayNames.indexOf(dayNames[d])])
                      .join(", ")}
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

            {/* Thông tin người đóng góp (Tôn vinh cộng đồng) */}
            <div className="ed-sidebar-item">
              <div className="ed-icon-box">
                <i className="fas fa-user-edit"></i>
              </div>
              <div className="ed-text-box">
                <small>Cung cấp bởi</small>
                <p>{event.contributorName || "Cộng đồng EviGo"}</p>
                <span style={{ fontSize: "11px", color: "#27ae60" }}>
                  <i className="fas fa-check-circle"></i> Đã duyệt thông tin
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

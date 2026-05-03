import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios"; // Đảm bảo em đã cài axios
import "./EventDetail.css";

export default function EventDetail() {
  const { id } = useParams(); // Lấy ID từ URL
  const navigate = useNavigate();

  // 1. Khởi tạo State để lưu dữ liệu sự kiện
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Tự động cuộn lên đầu trang và gọi API lấy dữ liệu
  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchDetail = async () => {
      try {
        // Gọi API lấy chi tiết sự kiện theo ID
        const res = await axios.get(`http://localhost:5000/api/events/${id}`);
        setEvent(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Lỗi lấy dữ liệu thật:", err);
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  // Nếu đang tải hoặc không thấy sự kiện
  if (loading)
    return <div className="ed-loading">Đang tải thông tin EviGo...</div>;
  if (!event)
    return (
      <div className="ed-error">Không tìm thấy sự kiện này rồi Như ơi!</div>
    );

  return (
    <div className="ed-wrapper">
      {/* 1. Hero Banner Section - Dùng ảnh banner từ Database */}
      <header className="ed-hero">
        <img
          src={event.image || event.banner}
          alt="Banner"
          className="ed-hero-img"
        />
        <div className="ed-hero-overlay">
          <div className="ed-container">
            <button className="ed-btn-back" onClick={() => navigate("/")}>
              <i className="fas fa-chevron-left"></i> Quay lại
            </button>
            <div className="ed-hero-content">
              <span className="ed-badge">{event.type || event.category}</span>
              <h1 className="ed-main-title">{event.title}</h1>
              <p className="ed-hero-loc">
                📍 {event.address}, {event.district}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Layout */}
      <main className="ed-container ed-main-grid">
        {/* Cột Trái: Nội dung chi tiết */}
        <div className="ed-content-left">
          <section className="ed-card">
            <h2 className="ed-section-title">Giới thiệu sự kiện</h2>
            <p className="ed-desc">{event.description}</p>
            <div className="ed-tags">
              {/* Nếu DB có mảng tags thì hiện, không thì hiện mặc định */}
              {(event.tags || ["EviGo", "Sự kiện"]).map((tag) => (
                <span key={tag} className="ed-tag">
                  #{tag}
                </span>
              ))}
            </div>
          </section>

          <section className="ed-card">
            <h2 className="ed-section-title">Vị trí thực tế</h2>
            <div className="ed-map-box">
              <div className="ed-map-inner">
                {/* Sau này Như chèn Component Map vào đây nhé */}
                <i className="fas fa-map-marked-alt ed-map-icon"></i>
                <p>
                  Toạ độ GIS: {event.lat}, {event.lng}
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Cột Phải: Thông tin nhanh */}
        <aside className="ed-sidebar">
          <div className="ed-sticky-card">
            <div className="ed-sidebar-item">
              <div className="ed-icon-box">
                <i className="far fa-calendar-alt"></i>
              </div>
              <div className="ed-text-box">
                <small>Thời gian</small>
                <p>{new Date(event.date).toLocaleDateString("vi-VN")}</p>
                <span>{event.time || "08:00 - 22:00"}</span>
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
                <i className="fas fa-user-tie"></i>
              </div>
              <div className="ed-text-box">
                <small>Ban tổ chức</small>
                <p>{event.organizer || "Cộng đồng EviGo"}</p>
              </div>
            </div>

            <button className="ed-btn-primary">Đăng ký tham gia ngay</button>
            <div className="ed-btn-group">
              <button className="ed-btn-outline">
                <i className="far fa-heart"></i> Lưu
              </button>
              <button className="ed-btn-outline">
                <i className="fas fa-share-alt"></i> Chia sẻ
              </button>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

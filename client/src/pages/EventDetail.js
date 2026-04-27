import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./EventDetail.css";

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Tự động cuộn lên đầu trang khi vào
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Dữ liệu mẫu (Như sẽ thay bằng API sau này)
  const event = {
    title: "Lễ hội Ám thực Việt Nam 2026",
    category: "Ẩm thực",
    location: "Công viên Lê Văn Tám, Quận 1, TP.HCM",
    date: "10/05 - 12/05/2026",
    time: "08:00 - 22:00",
    price: "Miễn phí vào cổng",
    description:
      "Khám phá hương vị ẩm thực ba miền với hơn 200 gian hàng đặc sắc. Sự kiện còn có các màn trình diễn nấu ăn từ các đầu bếp hàng đầu và không gian âm nhạc dân gian truyền thống.",
    banner:
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1300&auto=format&fit=crop",
    organizer: "Sở Du lịch TP.HCM",
    tags: ["Lễ hội", "Văn hóa", "Ẩm thực"],
  };

  return (
    <div className="ed-wrapper">
      {/* 1. Hero Banner Section */}
      <header className="ed-hero">
        <img src={event.banner} alt="Banner" className="ed-hero-img" />
        <div className="ed-hero-overlay">
          <div className="ed-container">
            <button className="ed-btn-back" onClick={() => navigate("/")}>
              <i className="fas fa-chevron-left"></i> Quay lại
            </button>
            <div className="ed-hero-content">
              <span className="ed-badge">{event.category}</span>
              <h1 className="ed-main-title">{event.title}</h1>
              <p className="ed-hero-loc">📍 {event.location}</p>
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
              {event.tags.map((tag) => (
                <span key={tag} className="ed-tag">
                  #{tag}
                </span>
              ))}
            </div>
          </section>

          <section className="ed-card">
            <h2 className="ed-section-title">Vị trí thực tế</h2>
            <div className="ed-map-box">
              {/* Đây là nơi Như sẽ chèn Leaflet Map */}
              <div className="ed-map-inner">
                <i className="fas fa-map-marked-alt ed-map-icon"></i>
                <p>Bản đồ GIS đang được tải...</p>
              </div>
            </div>
          </section>
        </div>

        {/* Cột Phải: Thông tin nhanh & Đặt chỗ */}
        <aside className="ed-sidebar">
          <div className="ed-sticky-card">
            <div className="ed-sidebar-item">
              <div className="ed-icon-box">
                <i className="far fa-calendar-alt"></i>
              </div>
              <div className="ed-text-box">
                <small>Thời gian</small>
                <p>{event.date}</p>
                <span>{event.time}</span>
              </div>
            </div>

            <div className="ed-sidebar-item">
              <div className="ed-icon-box">
                <i className="fas fa-ticket-alt"></i>
              </div>
              <div className="ed-text-box">
                <small>Giá vé</small>
                <p className="ed-price">{event.price}</p>
              </div>
            </div>

            <div className="ed-sidebar-item">
              <div className="ed-icon-box">
                <i className="fas fa-user-tie"></i>
              </div>
              <div className="ed-text-box">
                <small>Ban tổ chức</small>
                <p>{event.organizer}</p>
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

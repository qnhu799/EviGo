import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { Link } from "react-router-dom";
import axios from "axios";
import EventCard from "./EventCard";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./Home.css";

import banner1 from "../assets/banner/1.png";
import banner2 from "../assets/banner/2.png";
import banner3 from "../assets/banner/3.png";
import imgAmNhac from "../assets/theloaisukien/amnhac.png";
import imgTrienLam from "../assets/theloaisukien/trienlam.png";
import imgAmThuc from "../assets/theloaisukien/amthuc.png";
import imgTheThao from "../assets/theloaisukien/thethao.png";
import imgHocThuat from "../assets/theloaisukien/hocthuat.png";

export default function Home() {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [visibleCounts, setVisibleCounts] = useState({
    amNhac: 3,
    trienLam: 3,
    amThuc: 3,
    theThao: 3,
    hocThuat: 3,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchEvents = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/events/approved",
        );
        setEvents(res.data);
      } catch (err) {
        console.error("Lỗi lấy dữ liệu:", err);
      }
    };
    fetchEvents();
  }, []);

  const toNoneTone = (str) => {
    if (!str) return "";
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase()
      .trim();
  };

  const getEventsByType = (type, count) => {
    return events.filter((ev) => ev.type === type).slice(0, count);
  };

  const handleShowMore = (category) => {
    setVisibleCounts((prev) => ({ ...prev, [category]: prev[category] + 3 }));
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const scrollToEvent = (eventId) => {
    const element = document.getElementById(eventId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      setShowSuggestions(false);
      setSearchTerm("");
    }
  };

  return (
    <div className="home-container">
      {/* 1. Banner Slider */}
      <section className="banner-slider">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={0}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 3000 }}
          loop={true}
          className="mySwiper"
        >
          <SwiperSlide>
            <div
              className="slide-item"
              style={{ backgroundImage: `url(${banner1})` }}
            ></div>
          </SwiperSlide>
          <SwiperSlide>
            <div
              className="slide-item"
              style={{ backgroundImage: `url(${banner2})` }}
            ></div>
          </SwiperSlide>
          <SwiperSlide>
            <div
              className="slide-item"
              style={{ backgroundImage: `url(${banner3})` }}
            ></div>
          </SwiperSlide>
        </Swiper>
      </section>

      {/* 2. Thanh Tìm kiếm với Dropdown cố định và Địa chỉ lấy từ mảng locations */}
      <section className="search-container">
        <div className="search-wrapper" style={{ position: "relative" }}>
          <div className="search-input-group">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, địa điểm, giới thiệu..."
              className="search-input-field"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
            />
          </div>
          <button className="search-submit-btn">Tìm kiếm</button>

          {/* BẢNG GỢI Ý THẢ XUỐNG */}
          {searchTerm.trim() !== "" && showSuggestions && (
            <div className="search-suggestions-portal">
              {events
                .filter((ev) => {
                  const input = toNoneTone(searchTerm);
                  // Gom tất cả thông tin tìm kiếm bao gồm cả các trường trong mảng locations
                  const locString = ev.locations
                    ? ev.locations
                        .map((l) => `${l.address} ${l.district}`)
                        .join(" ")
                    : "";
                  const searchable = toNoneTone(
                    `${ev.name} ${ev.title} ${ev.type} ${locString} ${ev.district}`,
                  );
                  return searchable.includes(input);
                })
                .slice(0, 6)
                .map((ev) => (
                  <div
                    key={ev._id}
                    className="suggestion-item"
                    onClick={() => scrollToEvent(ev._id)}
                  >
                    <div className="suggestion-info">
                      <div className="suggestion-header-row">
                        <span className="suggestion-name">
                          {ev.name || ev.title || "Sự kiện không tên"}
                        </span>
                        <span className="suggestion-tag">
                          {ev.type || "Sự kiện"}
                        </span>
                      </div>
                      <div className="suggestion-bottom-row">
                        <span className="suggestion-location">
                          📍{" "}
                          {(() => {
                            // Ưu tiên lấy từ mảng locations của em
                            if (ev.locations && ev.locations.length > 0) {
                              const loc = ev.locations[0];
                              const parts = [loc.address, loc.district].filter(
                                (p) => p && p.trim() !== "",
                              );
                              return parts.length > 0
                                ? parts.join(", ")
                                : "Đang cập nhật địa chỉ...";
                            }
                            // Dự phòng nếu dữ liệu nằm ở các trường ngoài mảng
                            const addrParts = [ev.address, ev.district].filter(
                              (p) => p && p.trim() !== "",
                            );
                            return addrParts.length > 0
                              ? addrParts.join(", ")
                              : "Đang cập nhật địa chỉ...";
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

              {/* Thông báo nếu không khớp cái nào */}
              {events.filter((ev) => {
                const locString = ev.locations
                  ? ev.locations
                      .map((l) => `${l.address} ${l.district}`)
                      .join(" ")
                  : "";
                return toNoneTone(
                  `${ev.name || ev.title} ${locString}`,
                ).includes(toNoneTone(searchTerm));
              }).length === 0 && (
                <div className="suggestion-item no-res">
                  Không tìm thấy kết quả phù hợp
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 3. Danh mục Thể loại */}
      <section className="categories-container">
        <h2 className="categories-title">Thể loại sự kiện</h2>
        <div className="categories-grid">
          {[
            {
              id: 1,
              name: "Âm nhạc",
              image: imgAmNhac,
              targetId: "section-am-nhac",
            },
            {
              id: 2,
              name: "Triễn lãm",
              image: imgTrienLam,
              targetId: "section-trien-lam",
            },
            {
              id: 3,
              name: "Ẩm thực",
              image: imgAmThuc,
              targetId: "section-am-thuc",
            },
            {
              id: 4,
              name: "Thể thao",
              image: imgTheThao,
              targetId: "section-the-thao",
            },
            {
              id: 5,
              name: "Học thuật",
              image: imgHocThuat,
              targetId: "section-hoc-thuat",
            },
          ].map((cat) => (
            <div
              className="category-item"
              key={cat.id}
              onClick={() => scrollToSection(cat.targetId)}
            >
              <div className="category-circle-placeholder">
                <img src={cat.image} alt={cat.name} className="category-img" />
              </div>
              <p className="category-name">{cat.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DANH SÁCH SỰ KIỆN - GIỮ NGUYÊN */}
      <section id="section-am-nhac" className="featured-events">
        <div className="section-header">
          <h2 className="section-title">Âm nhạc</h2>
        </div>
        <div className="events-grid">
          {getEventsByType("Âm nhạc", visibleCounts.amNhac).map((ev) => (
            <div id={ev._id} key={ev._id}>
              <EventCard event={ev} />
            </div>
          ))}
        </div>
        <button
          className="see-more-btn"
          onClick={() => handleShowMore("amNhac")}
        >
          Xem thêm
        </button>
      </section>

      <section id="section-trien-lam" className="featured-events">
        <div className="section-header">
          <h2 className="section-title">Triễn lãm</h2>
        </div>
        <div className="events-grid">
          {getEventsByType("Triển lãm", visibleCounts.trienLam).map((ev) => (
            <div id={ev._id} key={ev._id}>
              <EventCard event={ev} />
            </div>
          ))}
        </div>
        <button
          className="see-more-btn"
          onClick={() => handleShowMore("trienLam")}
        >
          Xem thêm
        </button>
      </section>

      <section className="map-cta-container">
        <div className="map-cta-content">
          <h2 className="map-cta-title">Discover Events Around You</h2>
          <Link to="/map" style={{ textDecoration: "none" }}>
            <button className="map-cta-button">
              Khám phá bản đồ <span className="arrow">→</span>
            </button>
          </Link>
        </div>
      </section>

      <section id="section-am-thuc" className="featured-events">
        <div className="section-header">
          <h2 className="section-title">Ẩm thực</h2>
        </div>
        <div className="events-grid">
          {getEventsByType("Ẩm thực", visibleCounts.amThuc).map((ev) => (
            <div id={ev._id} key={ev._id}>
              <EventCard event={ev} />
            </div>
          ))}
        </div>
        <button
          className="see-more-btn"
          onClick={() => handleShowMore("amThuc")}
        >
          Xem thêm
        </button>
      </section>

      <section id="section-the-thao" className="featured-events">
        <div className="section-header">
          <h2 className="section-title">Thể thao</h2>
        </div>
        <div className="events-grid">
          {getEventsByType("Thể thao", visibleCounts.theThao).map((ev) => (
            <div id={ev._id} key={ev._id}>
              <EventCard event={ev} />
            </div>
          ))}
        </div>
        <button
          className="see-more-btn"
          onClick={() => handleShowMore("theThao")}
        >
          Xem thêm
        </button>
      </section>

      <section id="section-hoc-thuat" className="featured-events">
        <div className="section-header">
          <h2 className="section-title">Học thuật</h2>
        </div>
        <div className="events-grid">
          {getEventsByType("Học thuật", visibleCounts.hocThuat).map((ev) => (
            <div id={ev._id} key={ev._id}>
              <EventCard event={ev} />
            </div>
          ))}
        </div>
        <button
          className="see-more-btn"
          onClick={() => handleShowMore("hocThuat")}
        >
          Xem thêm
        </button>
      </section>
    </div>
  );
}

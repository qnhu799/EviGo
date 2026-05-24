import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { Link, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const [visibleCounts, setVisibleCounts] = useState({
    amNhac: 3,
    trienLam: 3,
    amThuc: 3,
    theThao: 3,
    hocThuat: 3,
  });

  const [allEventsCount, setAllEventsCount] = useState(3);

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

  const filteredSuggestions = events
    .filter((ev) => {
      const input = toNoneTone(searchTerm);
      const locString = ev.locations
        ? ev.locations.map((l) => `${l.address} ${l.district}`).join(" ")
        : "";
      const searchable = toNoneTone(
        `${ev.name || ev.title} ${ev.type} ${locString}`,
      );
      return searchable.includes(input);
    })
    .slice(0, 6);

  useEffect(() => {
    setFocusedIndex(-1);
  }, [searchTerm]);

  const scrollToEvent = (eventId) => {
    const element = document.getElementById(eventId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.style.transition = "0.5s";
      element.style.transform = "scale(1.05)";
      setTimeout(() => {
        element.style.transform = "scale(1)";
      }, 1000);
      setShowSuggestions(false);
      setSearchTerm("");
    } else {
      navigate("/map", { state: { keyword: searchTerm } });
    }
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) return;
    navigate("/map", { state: { keyword: searchTerm } });
  };

  const handleKeyDown = (e) => {
    if (searchTerm.trim() === "" || filteredSuggestions.length === 0) {
      if (e.key === "Enter") handleSearch();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) =>
        prev < filteredSuggestions.length - 1 ? prev + 1 : prev,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      if (focusedIndex >= 0) {
        e.preventDefault();
        scrollToEvent(filteredSuggestions[focusedIndex]._id);
      } else {
        handleSearch();
      }
    }
  };

  const handleCategoryClick = (categoryName) => {
    const categoryMap = {
      "Âm nhạc": "section-am-nhac",
      "Triển lãm": "section-trien-lam",
      "Ẩm thực": "section-am-thuc",
      "Thể thao": "section-the-thao",
      "Học thuật": "section-hoc-thuat",
    };

    const targetId = categoryMap[categoryName];
    const element = document.getElementById(targetId);

    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      navigate("/map", { state: { category: categoryName } });
    }
  };

  // 🚀 ĐÃ CẬP NHẬT: Sử dụng kỹ thuật quét chuỗi bao phủ .includes() để lọc chính xác đa danh mục dữ liệu sự kiện gộp dấu phẩy
  const getEventsByType = (type, count) =>
    events
      .filter((ev) => {
        if (!ev.type) return false;
        // Bóc tách chuỗi gộp "Học thuật, Triển lãm" thành mảng tự do để đối sánh không lệch chữ
        const typesArray = ev.type.split(",").map((t) => t.trim());
        return typesArray.includes(type);
      })
      .slice(0, count);

  const handleShowMore = (category) => {
    setVisibleCounts((prev) => ({ ...prev, [category]: prev[category] + 3 }));
  };

  return (
    <div className="home-container">
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
          {[banner1, banner2, banner3].map((bn, idx) => (
            <SwiperSlide key={idx}>
              <div
                className="slide-item"
                style={{ backgroundImage: `url(${bn})` }}
              ></div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

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
              onKeyDown={handleKeyDown}
            />
          </div>
          <button className="search-submit-btn" onClick={handleSearch}>
            Tìm kiếm
          </button>

          {searchTerm.trim() !== "" && showSuggestions && (
            <div className="search-suggestions-portal">
              {filteredSuggestions.map((ev, index) => (
                <div
                  key={ev._id}
                  className={`suggestion-item ${index === focusedIndex ? "focused" : ""}`}
                  onClick={() => scrollToEvent(ev._id)}
                  onMouseEnter={() => setFocusedIndex(index)}
                >
                  <div className="suggestion-info">
                    <div className="suggestion-header-row">
                      <span className="suggestion-name">
                        {ev.name || ev.title}
                      </span>
                      <span className="suggestion-tag">{ev.type}</span>
                    </div>
                    <div className="suggestion-bottom-row">
                      <span className="suggestion-location">
                        📍 {ev.locations?.[0]?.address || "Hồ Chí Minh City"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="categories-container">
        <h2 className="categories-title">Thể loại sự kiện</h2>
        <div className="categories-grid">
          {[
            { id: 1, name: "Âm nhạc", image: imgAmNhac },
            { id: 2, name: "Triển lãm", image: imgTrienLam },
            { id: 3, name: "Ẩm thực", image: imgAmThuc },
            { id: 4, name: "Thể thao", image: imgTheThao },
            { id: 5, name: "Học thuật", image: imgHocThuat },
          ].map((cat) => (
            <div
              className="category-item"
              key={cat.id}
              onClick={() => handleCategoryClick(cat.name)}
              style={{ cursor: "pointer" }}
            >
              <div className="category-circle-placeholder">
                <img src={cat.image} alt={cat.name} className="category-img" />
              </div>
              <p className="category-name">{cat.name}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="section-am-nhac" className="featured-events">
        <h2 className="section-title">Âm nhạc</h2>
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
        <h2 className="section-title">Triển lãm</h2>
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
        <h2 className="section-title">Ẩm thực</h2>
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
        <h2 className="section-title">Thể thao</h2>
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
        <h2 className="section-title">Học thuật</h2>
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

      <section className="featured-events all-events-section-wrapper">
        <h2 className="section-title">Tất cả sự kiện</h2>
        <div className="events-grid">
          {events.slice(0, allEventsCount).map((ev) => (
            <div id={ev._id} key={ev._id}>
              <EventCard event={ev} />
            </div>
          ))}
        </div>

        {allEventsCount < events.length && (
          <button
            className="see-more-btn all-events-more-btn"
            onClick={() => setAllEventsCount((prev) => prev + 3)}
          >
            Xem thêm
          </button>
        )}
      </section>
    </div>
  );
}

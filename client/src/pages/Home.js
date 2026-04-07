import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { Link } from "react-router-dom";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./Home.css";
import banner1 from "../assets/banner/1.png";
import banner2 from "../assets/banner/2.png";
import banner3 from "../assets/banner/3.png";

export default function Home() {
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
          {/* Slide 1 */}
          <SwiperSlide>
            <div
              className="slide-item"
              style={{ backgroundImage: `url(${banner1})` }}
            ></div>
          </SwiperSlide>

          {/* Slide 2 */}
          <SwiperSlide>
            <div
              className="slide-item"
              style={{ backgroundImage: `url(${banner2})` }}
            ></div>
          </SwiperSlide>

          {/* Slide 3 */}
          <SwiperSlide>
            <div
              className="slide-item"
              style={{ backgroundImage: `url(${banner3})` }}
            ></div>
          </SwiperSlide>
        </Swiper>
      </section>

      {/* 2. Thanh Tìm kiếm */}
      <section className="search-container">
        <div className="search-wrapper">
          <div className="search-input-group">
            <input
              type="text"
              placeholder="Tìm kiếm sự kiện..."
              className="search-input-field"
            />
          </div>
          <button className="search-submit-btn">Tìm kiếm</button>
        </div>
      </section>

      {/* 3. Danh mục Thể loại sự kiện */}
      <section className="categories-container">
        <h2 className="categories-title">Thể loại sự kiện</h2>
        <div className="categories-grid">
          {[
            { id: 1, name: "Âm nhạc", icon: "🎵" },
            { id: 2, name: "Nghệ thuật", icon: "🎨" },
            { id: 3, name: "Ẩm thực", icon: "🍴" },
            { id: 4, name: "Thể thao", icon: "🏃‍♂️" },
            { id: 5, name: "Học thuật", icon: "🎓" },
          ].map((cat) => (
            <div className="category-item" key={cat.id}>
              <div className="category-circle-placeholder">
                <span className="category-icon">{cat.icon}</span>
              </div>
              <p className="category-name">{cat.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Danh sách Sự kiện nổi bật (Đóng góp) */}
      <section className="featured-events">
        <div className="section-header">
          <h2 className="section-title">Sự kiện nổi bật</h2>
          {/* Nút Xem thêm để dẫn qua trang danh sách sự kiện */}
          <button className="see-more-btn">Xem thêm</button>
        </div>

        <div className="events-grid">
          {[1, 2, 3].map((event) => (
            <div className="event-card" key={event}>
              <div className="event-image-wrapper">
                {/* Ảnh tượng trưng cho đến khi có data thật */}
                <img
                  src={`https://images.unsplash.com/photo-${event === 1 ? "1533174072545-7a4b6ad7a6c3" : event === 2 ? "1501281668745-f7f57925c3b4" : "1540575861858-54d116301827"}?q=80&w=400&auto=format&fit=crop`}
                  alt="Sự kiện EviGo"
                  className="event-image"
                />
              </div>

              <div className="event-details">
                <h3 className="event-name">Lễ hội Ám thực Việt</h3>
                <p className="event-location">
                  <i className="fas fa-map-marker-alt"></i> Công viên Lê Văn
                  Tám, Quận 1
                </p>
                <div className="event-meta">
                  <span className="event-date">
                    <i className="far fa-calendar-alt"></i> 10/05 - 12/05/2026
                  </span>
                  <span className="event-price">Miễn phí vào cổng</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Khối giới thiệu Bản đồ */}
      <section className="map-cta-container">
        <div className="map-cta-content">
          <h2 className="map-cta-title">Discover Events Around You</h2>

          {/* Bọc nút bấm bằng Link để dẫn sang trang bản đồ */}
          <Link to="/map" style={{ textDecoration: "none" }}>
            <button className="map-cta-button">
              Khám phá bản đồ <span className="arrow">→</span>
            </button>
          </Link>
        </div>
      </section>

      {/* 4. Danh sách Sự kiện nổi bật (Đóng góp) */}
      <section className="featured-events">
        <div className="section-header">
          <h2 className="section-title">Sự kiện nổi bật</h2>
          {/* Nút Xem thêm để dẫn qua trang danh sách sự kiện */}
          <button className="see-more-btn">Xem thêm</button>
        </div>

        <div className="events-grid">
          {/* Placeholder cho 3 sự kiện. Sau này phần này sẽ loop dữ liệu thực */}
          {[1, 2, 3].map((event) => (
            <div className="event-card" key={event}>
              <div className="event-image-wrapper">
                {/* Ảnh tượng trưng cho đến khi có data thật */}
                <img
                  src={`https://images.unsplash.com/photo-${event === 1 ? "1533174072545-7a4b6ad7a6c3" : event === 2 ? "1501281668745-f7f57925c3b4" : "1540575861858-54d116301827"}?q=80&w=400&auto=format&fit=crop`}
                  alt="Sự kiện EviGo"
                  className="event-image"
                />
              </div>

              <div className="event-details">
                <h3 className="event-name">Lễ hội Ám thực Việt</h3>
                <p className="event-location">
                  <i className="fas fa-map-marker-alt"></i> Công viên Lê Văn
                  Tám, Quận 1
                </p>
                <div className="event-meta">
                  <span className="event-date">
                    <i className="far fa-calendar-alt"></i> 10/05 - 12/05/2026
                  </span>
                  <span className="event-price">Miễn phí vào cổng</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Danh sách Sự kiện nổi bật (Đóng góp) */}
      <section className="featured-events">
        <div className="section-header">
          <h2 className="section-title">Sự kiện nổi bật</h2>
          {/* Nút Xem thêm để dẫn qua trang danh sách sự kiện */}
          <button className="see-more-btn">Xem thêm</button>
        </div>

        <div className="events-grid">
          {/* Placeholder cho 3 sự kiện. Sau này phần này sẽ loop dữ liệu thực */}
          {[1, 2, 3].map((event) => (
            <div className="event-card" key={event}>
              <div className="event-image-wrapper">
                {/* Ảnh tượng trưng cho đến khi có data thật */}
                <img
                  src={`https://images.unsplash.com/photo-${event === 1 ? "1533174072545-7a4b6ad7a6c3" : event === 2 ? "1501281668745-f7f57925c3b4" : "1540575861858-54d116301827"}?q=80&w=400&auto=format&fit=crop`}
                  alt="Sự kiện EviGo"
                  className="event-image"
                />
              </div>

              <div className="event-details">
                <h3 className="event-name">Lễ hội Ám thực Việt</h3>
                <p className="event-location">
                  <i className="fas fa-map-marker-alt"></i> Công viên Lê Văn
                  Tám, Quận 1
                </p>
                <div className="event-meta">
                  <span className="event-date">
                    <i className="far fa-calendar-alt"></i> 10/05 - 12/05/2026
                  </span>
                  <span className="event-price">Miễn phí vào cổng</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

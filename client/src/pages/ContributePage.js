import React, { useState } from "react";
import "./ContributePage.css";

const ContributePage = () => {
  return (
    <div className="contribute-container">
      <div className="contribute-card">
        <h1 className="contribute-title">Gợi ý sự kiện mới 🌟</h1>

        <div className="guide-box">
          <p>
            <strong>Hướng dẫn:</strong> Chia sẻ thông tin để cộng đồng khám phá
            thêm nhiều sự kiện thú vị quanh mình nhé!
          </p>
        </div>

        <form className="contribute-form">
          {/* PHẦN 1: THÔNG TIN CƠ BẢN */}
          <div className="form-section">
            <h3>1. Thông tin sự kiện</h3>
            <div className="form-group full-width">
              <label>
                Tên sự kiện <span className="required">*</span>
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Lễ hội Âm thực Việt Nam..."
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Loại sự kiện</label>
                <select required>
                  <option value="">Chọn loại sự kiện</option>
                  <option value="music">🎵 Âm nhạc</option>
                  <option value="food">🍕 Ẩm thực</option>
                  <option value="art">🎨 Nghệ thuật</option>
                  <option value="sport">🏀 Thể thao</option>
                  <option value="workshop">💡 Workshop</option>
                </select>
              </div>
              <div className="form-group">
                <label>Giá vé (Ghi "Miễn phí" nếu không thu phí)</label>
                <input
                  type="text"
                  placeholder="Ví dụ: 50.000đ hoặc Miễn phí..."
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Ngày bắt đầu</label>
                <input type="date" required />
              </div>
              <div className="form-group">
                <label>Thời gian diễn ra</label>
                <input type="time" required />
              </div>
            </div>
          </div>

          {/* PHẦN 2: ĐỊA ĐIỂM (GIS) */}
          <div className="form-section">
            <h3>2. Địa điểm diễn ra (Dành cho bản đồ)</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Quận / Huyện</label>
                <select required>
                  <option value="">Chọn Quận/Huyện</option>
                  <option value="Q1">Quận 1</option>
                  <option value="Q3">Quận 3</option>
                  <option value="Q4">Quận 4</option>
                  <option value=" Thủ Đức">Tp. Thủ Đức</option>
                  {/* Như thêm các quận khác vào đây nhé */}
                </select>
              </div>
              <div className="form-group">
                <label>Phường / Xã</label>
                <input type="text" placeholder="Nhập phường/xã..." />
              </div>
            </div>

            <div className="form-group full-width">
              <label>Địa chỉ cụ thể (Tên địa điểm, số nhà, tên đường...)</label>
              <input
                type="text"
                placeholder="Ví dụ: Công viên Lê Văn Tám, Đ. Võ Thị Sáu..."
                required
              />
            </div>

            {/* KHU VỰC BẢN ĐỒ - Như sẽ nhúng Leaflet vào đây sau */}
            <div className="map-picker-container">
              <div className="map-placeholder">
                <p>📍 Nhấn vào bản đồ để lấy tọa độ chính xác</p>
                {/* <MapContainer ... /> sẽ nằm ở đây */}
              </div>
            </div>
          </div>

          {/* PHẦN 3: HÌNH ẢNH & MÔ TẢ */}
          <div className="form-section">
            <h3>3. Nội dung chi tiết</h3>
            <div className="form-group full-width">
              <label>Hình ảnh sự kiện (Link ảnh hoặc tải lên)</label>
              <input type="file" className="file-input" accept="image/*" />
              <small className="help-text">
                Gợi ý: Tỷ lệ 16:9 để hiển thị đẹp nhất trên trang chủ.
              </small>
            </div>

            <div className="form-group full-width">
              <label>Mô tả chi tiết sự kiện</label>
              <textarea
                rows="4"
                placeholder="Kể cho mọi người biết sự kiện có gì hấp dẫn..."
              ></textarea>
            </div>
          </div>

          <button type="submit" className="submit-btn">
            Gửi đóng góp cho EviGo 🛡️
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContributePage;

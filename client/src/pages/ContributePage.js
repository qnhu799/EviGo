import React, { useState } from "react";
import axios from "axios";
import "./ContributePage.css";

const ContributePage = () => {
  // 1. Quản lý trạng thái Form
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    ticketPrice: "",
    date: "",
    time: "",
    district: "",
    address: "",
    description: "",
    lat: 10.871,
    lng: 106.792,
  });

  // 2. Hàm xử lý khi người dùng nhập liệu
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // 3. Hàm gửi dữ liệu về Server
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:5000/api/events/contribute",
        formData,
      );

      if (response.status === 201) {
        alert("Gửi thành công! Đang chờ Admin duyệt nhé ✨");
        setFormData({
          title: "",
          type: "",
          ticketPrice: "",
          date: "",
          time: "",
          district: "",
          address: "",
          description: "",
          lat: 10.871,
          lng: 106.792,
        });
      }
    } catch (error) {
      console.error("Lỗi rồi:", error);
      alert("Hệ thống đang bận hoặc Server chưa chạy, kiểm tra lại nhé!");
    }
  };

  return (
    <div className="contribute-container">
      <div className="contribute-card">
        <h1 className="contribute-title">Gợi ý sự kiện mới 🌟</h1>

        <div className="guide-box">
          <p>
            <strong>Hướng dẫn:</strong> Điền đầy đủ thông tin để ghim sự kiện
            lên bản đồ EviGo nhé!
          </p>
        </div>

        <form className="contribute-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>1. Thông tin sự kiện</h3>
            <div className="form-group full-width">
              <label>
                Tên sự kiện <span className="required">*</span>
              </label>
              <input
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                placeholder="Ví dụ: Lễ hội Âm thực Việt Nam..."
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Loại sự kiện</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  <option value="">Chọn loại sự kiện</option>
                  <option value="music">🎵 Âm nhạc</option>
                  <option value="food">🍕 Ẩm thực</option>
                  <option value="art">🎨 Nghệ thuật</option>
                  <option value="sport">🏀 Thể thao</option>
                  <option value="workshop">💡 Workshop</option>
                </select>
              </div>
              <div className="form-group">
                <label>Giá vé</label>
                <input
                  name="ticketPrice"
                  type="text"
                  value={formData.ticketPrice}
                  onChange={handleChange}
                  placeholder="Ví dụ: 50.000đ hoặc Miễn phí..."
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Ngày bắt đầu</label>
                <input
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Thời gian diễn ra</label>
                <input
                  name="time"
                  type="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>2. Địa điểm diễn ra (Dành cho bản đồ)</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Quận / Huyện</label>
                <select
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  required
                >
                  <option value="">Chọn Quận/Huyện</option>
                  <option value="Quận 1">Quận 1</option>
                  <option value="Quận 3">Quận 3</option>
                  <option value="Quận 4">Quận 4</option>
                  <option value="Thủ Đức">Tp. Thủ Đức</option>
                </select>
              </div>
              <div className="form-group">
                <label>Vị trí GIS (Lat, Lng)</label>
                <input
                  type="text"
                  value={`${formData.lat}, ${formData.lng}`}
                  disabled
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label>Địa chỉ cụ thể</label>
              <input
                name="address"
                type="text"
                value={formData.address}
                onChange={handleChange}
                placeholder="Số nhà, tên đường..."
                required
              />
            </div>

            <div className="map-picker-container">
              <div className="map-placeholder">
                <p>📍 (Bản đồ Leaflet sẽ nhúng tại đây để Như chấm tọa độ)</p>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>3. Nội dung chi tiết</h3>
            <div className="form-group full-width">
              <label>Mô tả chi tiết sự kiện</label>
              <textarea
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
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

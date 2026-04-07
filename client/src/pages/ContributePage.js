import React from "react";
import "./ContributePage.css";

const ContributePage = () => {
  return (
    <div className="contribute-container">
      <div className="contribute-card">
        <h1 className="contribute-title">Gợi ý sự kiện mới</h1>

        <div className="guide-box">
          <p>
            <strong>Hướng dẫn:</strong> Giúp cộng đồng khám phá những sự kiện
            thú vị! Hãy gợi ý sự kiện mà bạn biết.
          </p>
        </div>

        <form className="contribute-form">
          <div className="form-group full-width">
            <label>Tên sự kiện</label>
            <input type="text" placeholder="Nhập tên sự kiện..." />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phường/ Xã</label>
              <input type="text" placeholder="Nhập phường/ xã..." />
            </div>
            <div className="form-group">
              <label>Loại sự kiện</label>
              <select>
                <option value="">Chọn loại sự kiện</option>
                <option value="music">Âm nhạc</option>
                <option value="art">Nghệ thuật</option>
                <option value="sport">Thể thao</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Ngày sự kiện</label>
              <input type="date" />
            </div>
            <div className="form-group">
              <label>Thời gian diễn ra</label>
              <input type="time" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Địa chỉ cụ thể</label>
              <input type="text" placeholder="Số nhà, tên đường..." />
            </div>
            <div className="form-group">
              <label>Hình ảnh (nếu có)</label>
              <input type="file" className="file-input" />
            </div>
          </div>

          <div className="form-group full-width">
            <label>Mô tả sự kiện</label>
            <textarea
              rows="4"
              placeholder="Mô tả chi tiết về sự kiện..."
            ></textarea>
          </div>

          <div className="form-group full-width">
            <label>Tên của bạn</label>
            <input type="text" placeholder="Nhập tên của bạn..." />
          </div>

          <div className="form-group full-width">
            <label>Thông tin liên hệ (email/sđt - nếu có)</label>
            <input type="text" placeholder="Email hoặc số điện thoại..." />
          </div>

          <button type="submit" className="submit-btn">
            Đóng góp
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContributePage;

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./LoginPage.css";

export default function LoginPage() {
  const [isJoined, setIsJoined] = useState(false);

  // Hiệu ứng "hít khối" tự động chạy sau khi trang load
  useEffect(() => {
    const timer = setTimeout(() => setIsJoined(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="login-page-container">
      {/* Thêm class 'active' để kích hoạt hiệu ứng hít khối */}
      <div className={`login-box-wrapper ${isJoined ? "active" : ""}`}>
        {/* MẢNH TRÁI: ẢNH DECOR */}
        <div className="login-visual-side">
          <div className="visual-overlay">
            <h1>EviGo</h1>
            <p>Mừng bạn trở lại!</p>
          </div>
        </div>

        {/* MẢNH PHẢI: FORM ĐĂNG NHẬP */}
        <div className="login-form-side">
          <h2 className="login-form-title">Đăng nhập</h2>
          <p className="login-form-subtitle">
            Tiếp tục hành trình khám phá sự kiện
          </p>

          <form className="login-auth-form">
            <div className="login-input-field">
              <label>Email</label>
              <input type="email" placeholder="nhu.le@example.com" required />
            </div>

            <div className="login-input-field">
              <label>Mật khẩu</label>
              <input type="password" placeholder="••••••••" required />
            </div>

            <div className="login-forgot-link">
              <Link to="/forgot-password">Quên mật khẩu?</Link>
            </div>

            <button type="submit" className="login-btn-gradient">
              Đăng nhập ngay
            </button>
          </form>

          <p className="login-redirect-text">
            Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

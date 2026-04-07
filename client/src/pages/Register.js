import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Register.css";

export default function Register() {
  const [isJoined, setIsJoined] = useState(false);

  // Hiệu ứng tự động chạy vào nhau sau khi trang load 0.1s
  useEffect(() => {
    setTimeout(() => setIsJoined(true), 100);
  }, []);

  return (
    <div className="register-page">
      {/* Thêm class 'active' khi 2 mảnh đã nhập vào nhau */}
      <div className={`register-box ${isJoined ? "active" : ""}`}>
        <div className="register-left">
          <div className="overlay-content">
            <h1>EviGo</h1>
            <p>Khám phá sự kiện, kết nối đam mê.</p>
          </div>
        </div>

        <div className="register-right">
          <h2 className="form-title">Đăng ký</h2>
          <form className="auth-form">
            <div className="input-field">
              <label>Họ và tên</label>
              <input type="text" placeholder="Lê Quỳnh Như" />
            </div>
            <div className="input-field">
              <label>Email</label>
              <input type="email" placeholder="nhu.le@example.com" />
            </div>
            <div className="input-field">
              <label>Mật khẩu</label>
              <input type="password" placeholder="••••••••" />
            </div>
            <button type="submit" className="btn-gradient">
              Đăng ký ngay
            </button>
          </form>
          <p className="redirect-text">
            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

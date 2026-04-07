import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./ForgotPassword.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="forgot-password-container">
      <div className={`forgot-box ${isSubmitted ? "success-state" : ""}`}>
        <div className="forgot-header">
          <div className="icon-circle">🔑</div>
          <h2 className="forgot-title">Quên mật khẩu?</h2>
          <p className="forgot-subtitle">
            {isSubmitted
              ? "Kiểm tra email của Evier nhé!"
              : "Nhập email đăng ký để nhận mã khôi phục."}
          </p>
        </div>

        {!isSubmitted ? (
          <form className="forgot-form" onSubmit={handleSubmit}>
            <div className="forgot-input-group">
              <label>Email của Evier</label>
              <input
                type="email"
                placeholder="Evier@example.com"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="forgot-btn-submit">
              Gửi mã xác nhận
            </button>
          </form>
        ) : (
          <div className="success-message">
            <p>
              Hệ thống đã ghi nhận email: <strong>{email}</strong>
            </p>
            <p className="note">
              Mã OTP sẽ được gửi trong giây lát (Đang phát triển!)
            </p>
            <button
              className="forgot-btn-outline"
              onClick={() => setIsSubmitted(false)}
            >
              Gửi lại email khác
            </button>
          </div>
        )}

        <div className="forgot-footer">
          <Link to="/login" className="back-to-login">
            ← Quay lại Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}

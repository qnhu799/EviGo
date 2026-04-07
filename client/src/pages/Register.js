import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Register.css";

export default function Register() {
  const [isJoined, setIsJoined] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsJoined(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // 1. Gửi yêu cầu đăng ký đến Server
      const response = await axios.post(
        "http://localhost:5000/api/register",
        formData,
      );

      // --- CẬP NHẬT ĐỊNH DẠNG NGÀY: DD/MM/YY ---
      const now = new Date();
      const day = String(now.getDate()).padStart(2, "0");
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const year = String(now.getFullYear()).slice(-2); // Lấy 2 số cuối (2026 -> 26)

      const formattedDate = `${day}/${month}/${year}`; // Kết quả: 08/04/26

      // Lưu vào localStorage
      localStorage.setItem("username", formData.username);
      localStorage.setItem("email", formData.email);
      localStorage.setItem("joinedDate", formattedDate);

      // Báo tin cho Header cập nhật
      window.dispatchEvent(new Event("authChange"));

      // 2. Chuyển hướng sang Login
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi rồi Evier ơi!");
    }
  };

  return (
    <div className="register-page">
      <div className={`register-box ${isJoined ? "active" : ""}`}>
        <div className="register-left">
          <div className="overlay-content">
            <h1>EviGo</h1>
            <p>Khám phá sự kiện, kết nối đam mê.</p>
          </div>
        </div>

        <div className="register-right">
          <h2 className="form-title">Đăng ký</h2>

          <form className="auth-form" onSubmit={handleRegister}>
            {error && <div className="error-message-box">⚠️ {error}</div>}

            <div className="input-field">
              <label>Họ và tên</label>
              <input
                name="username"
                type="text"
                placeholder="Lê Quỳnh Như"
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-field">
              <label>Email</label>
              <input
                name="email"
                type="email"
                placeholder="nhu.le@example.com"
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-field">
              <label>Mật khẩu</label>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                onChange={handleChange}
                required
              />
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

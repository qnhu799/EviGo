import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast"; // 1. Import toast
import "./LoginPage.css";

export default function LoginPage() {
  const [isJoined, setIsJoined] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setIsJoined(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/api/login", formData);

      // 1. Lưu Token & Username
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("username", res.data.user.username);

      // 2. LOGIC ÉP QUYỀN TRONG CODE
      let userRole = res.data.user.role || "user";
      if (formData.email === "qnhu799@gmail.com") {
        userRole = "superadmin";
      }
      localStorage.setItem("role", userRole);
      window.dispatchEvent(new Event("authChange"));

      // 3. THÔNG BÁO TOAST XỊN MỊN
      toast.success(`Mừng ${res.data.user.username} trở lại!`, {
        duration: 3000,
        icon: userRole === "superadmin" ? "👑" : "👋",
      });

      // 4. ĐIỀU HƯỚNG
      if (userRole === "superadmin" || userRole === "admin") {
        navigate("/admindashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || "Lỗi rồi Evier ơi!";
      toast.error(errMsg);
      setError(errMsg);
    }
  };

  return (
    <div className="login-page-container">
      <div className={`login-box-wrapper ${isJoined ? "active" : ""}`}>
        <div className="login-visual-side">
          <div className="visual-overlay">
            <h1>EviGo</h1>
            <p>Mừng Evier trở lại!</p>
          </div>
        </div>

        <div className="login-form-side">
          <h2 className="login-form-title">Đăng nhập</h2>
          <p className="login-form-subtitle">
            Tiếp tục hành trình khám phá sự kiện
          </p>

          <form className="login-auth-form" onSubmit={handleLogin}>
            {error && <div className="error-message-box">⚠️ {error}</div>}
            <div className="login-input-field">
              <label>Email</label>
              <input
                name="email"
                type="email"
                placeholder="qnhu799@gmail.com"
                onChange={handleChange}
                value={formData.email}
                required
              />
            </div>

            <div className="login-input-field">
              <label>Mật khẩu</label>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                onChange={handleChange}
                value={formData.password}
                required
              />
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

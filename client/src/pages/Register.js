import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
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
      const response = await axios.post(
        "http://localhost:5000/api/register",
        formData,
      );

      const now = new Date();
      const day = String(now.getDate()).padStart(2, "0");
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const year = String(now.getFullYear()).slice(-2);
      const formattedDate = `${day}/${month}/${year}`;

      let userRole = response.data.user?.role || "user";
      if (formData.email === "qnhu799@gmail.com") {
        userRole = "superadmin";
      }

      localStorage.setItem("username", formData.username);
      localStorage.setItem("email", formData.email);
      localStorage.setItem("joinedDate", formattedDate);
      localStorage.setItem("role", userRole);

      window.dispatchEvent(new Event("authChange"));

      // 2. SỬ DỤNG TOAST THAY CHO ALERT
      if (userRole === "superadmin") {
        toast.success("Chào mừng Super Admin! Quyền tối thượng đã kích hoạt.", {
          duration: 3000,
          icon: "👑",
        });
      } else {
        toast.success("Đăng ký thành công! Chào mừng Evier mới nhé!", {
          duration: 3000,
        });
      }

      // Đợi 2 giây cho user kịp đọc thông báo rồi mới chuyển trang
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      const message = err.response?.data?.message || "Có lỗi rồi Evier ơi!";
      toast.error(message);
      setError(message);
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
              <label>Tên tài khoản</label>
              <input
                name="username"
                type="text"
                placeholder="Nhập tên tài khoản..."
                onChange={handleChange}
                value={formData.username}
                required
              />
            </div>
            <div className="input-field">
              <label>Email</label>
              <input
                name="email"
                type="email"
                placeholder="Nhập email..."
                onChange={handleChange}
                value={formData.email}
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
                value={formData.password}
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

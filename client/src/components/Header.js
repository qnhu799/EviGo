import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header.css";

export default function Header() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [username, setUsername] = useState(null);
  const [role, setRole] = useState(null);
  const navigate = useNavigate();
  const popupRef = useRef(null);

  const checkAuth = () => {
    const savedName = localStorage.getItem("username");
    const savedRole = localStorage.getItem("role")?.toLowerCase();
    setUsername(savedName);
    setRole(savedRole);
  };

  useEffect(() => {
    checkAuth();
    window.addEventListener("authChange", checkAuth);
    window.addEventListener("storage", checkAuth);

    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setIsPopupOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("authChange", checkAuth);
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setUsername(null);
    setRole(null);
    setIsPopupOpen(false);
    window.dispatchEvent(new Event("authChange"));
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="logo">
        <Link to="/" style={{ textDecoration: "none", color: "white" }}>
          EviGO
        </Link>
      </div>

      <div className="menu-container">
        <nav className="menu-links">
          {/* 🌍 CẤP 1 - KHÁCH: Luôn hiện */}
          <Link to="/">Trang chủ</Link>
          <Link to="/map">Bản đồ</Link>

          {/* 👤 CẤP 2 - THÀNH VIÊN: Chỉ hiện khi đã đăng nhập (role tồn tại) */}
          {username && <Link to="/contribute">Đóng góp</Link>}

          {/* 🛡️ CẤP 3 - QUẢN TRỊ VIÊN: Phải là admin hoặc superadmin */}
          {(role === "admin" || role === "superadmin") && (
            <Link to="/admin">Quản lý</Link>
          )}

          {/* 👑 CẤP 4 - SUPERADMIN: Dashboard đặc biệt */}
          {role === "superadmin" && (
            <Link
              to="/admindashboard"
              className="menu-item-dashboard-link"
              style={{
                background: "rgba(255, 235, 59, 0.2)",
                padding: "5px 12px",
                borderRadius: "20px",
                border: "1px solid #ffeb3b",
                color: "#ffeb3b",
                fontWeight: "bold",
                marginLeft: "10px",
              }}
            >
              Dashboard 👑
            </Link>
          )}
        </nav>

        <div className="user-menu-wrapper" ref={popupRef}>
          <div
            className="avatar-circle"
            onClick={() => setIsPopupOpen(!isPopupOpen)}
          >
            {username ? (
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=635bff&color=fff&rounded=true&bold=true&size=128`}
                alt="Avatar"
                className="avatar-img"
              />
            ) : (
              <div className="avatar-placeholder">
                <span style={{ color: "#280d8c", fontWeight: "bold" }}>?</span>
              </div>
            )}
          </div>

          {isPopupOpen && (
            <div className="auth-popup">
              {username ? (
                <>
                  <div className="popup-welcome-container">
                    Chào <b>{username}</b>! <br />
                    <small style={{ color: "#666", fontSize: "11px" }}>
                      (
                      {role === "superadmin"
                        ? "Super Admin 👑"
                        : role === "admin"
                          ? "Quản trị viên"
                          : "Thành viên"}
                      )
                    </small>
                  </div>
                  <Link
                    to="/profile"
                    className="popup-link"
                    onClick={() => setIsPopupOpen(false)}
                  >
                    Trang cá nhân
                  </Link>
                  <div className="popup-divider"></div>
                  <button
                    className="popup-link logout-btn-style"
                    onClick={handleLogout}
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="popup-link"
                    onClick={() => setIsPopupOpen(false)}
                  >
                    Đăng nhập
                  </Link>
                  <div className="popup-divider"></div>
                  <Link
                    to="/register"
                    className="popup-link"
                    onClick={() => setIsPopupOpen(false)}
                  >
                    Đăng ký
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

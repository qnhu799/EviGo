import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header.css";

export default function Header() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [username, setUsername] = useState(null);
  const navigate = useNavigate();
  const popupRef = useRef(null);

  const checkAuth = () => {
    const savedName = localStorage.getItem("username");
    setUsername(savedName);
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
          <Link to="/">Trang chủ</Link>
          <Link to="/map">Bản đồ</Link>
          <Link to="/contribute">Đóng góp</Link>
          <Link to="/admin">Quản lý</Link>
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
                    Chào <b>{username}</b>!
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
                    className="popup-link btn-logout-text"
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

import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header.css";

export default function Header() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const navigate = useNavigate();
  const isLoggedIn = false;
  const popupRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setIsPopupOpen(false);
      }
    };

    // Gắn sự kiện khi component hiện ra
    document.addEventListener("mousedown", handleClickOutside);

    // Dọn dẹp sự kiện khi component biến mất
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAvatarClick = () => {
    if (isLoggedIn) {
      navigate("/profile");
    } else {
      setIsPopupOpen(!isPopupOpen);
    }
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
          <div className="avatar-circle" onClick={handleAvatarClick}></div>

          {!isLoggedIn && isPopupOpen && (
            <div className="auth-popup">
              <Link
                to="/login"
                className="popup-link"
                onClick={() => setIsPopupOpen(false)}
              >
                Đăng nhập
              </Link>

              <div
                style={{
                  height: "1px",
                  background: "#eee",
                  margin: "5px 15px",
                }}
              ></div>

              <Link
                to="/register"
                className="popup-link"
                onClick={() => setIsPopupOpen(false)}
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

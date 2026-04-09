import React, { useState, useEffect } from "react";
import "./ProfilePage.css";
import { Link } from "react-router-dom";

export default function ProfilePage() {
  // 1. Khởi tạo state với dữ liệu mặc định
  const [user, setUser] = useState({
    name: "Khách",
    email: "user@evigo.vn",
    avatar:
      "https://ui-avatars.com/api/?name=User&background=635bff&color=fff&size=128",
    contributionCount: 15,
    rank: "Sứ giả sự kiện",
    joinedDate: "Tháng 01, 2026", // Ngày dự phòng
  });

  // 2. useEffect để lấy dữ liệu thực tế khi trang load
  useEffect(() => {
    // Lấy tất cả "báu vật" từ localStorage mà em đã lưu lúc Register/Login
    const savedName = localStorage.getItem("username");
    const savedEmail = localStorage.getItem("email");
    const savedJoinedDate = localStorage.getItem("joinedDate");

    if (savedName) {
      setUser((prev) => ({
        ...prev,
        name: savedName,
        email:
          savedEmail ||
          `${savedName.toLowerCase().replace(/\s/g, "")}@example.com`,
        // Lấy đúng ngày tham gia từ lúc đăng ký tài khoản
        joinedDate: savedJoinedDate || prev.joinedDate,
        // Cập nhật Avatar động theo tên mới lấy được
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(savedName)}&background=635bff&color=fff&size=128&bold=true`,
      }));
    }
  }, []);

  return (
    <div className="profile-container">
      <div className="profile-card">
        {/* PHẦN ĐẦU: THÔNG TIN CHÍNH */}
        <div className="profile-header">
          <div className="profile-avatar-wrapper">
            <img src={user.avatar} alt="Avatar" className="profile-img" />
            <div className="rank-badge">{user.rank}</div>
          </div>
          <h2 className="profile-name">{user.name}</h2>
          <p className="profile-email">{user.email}</p>
          <button className="edit-btn">Chỉnh sửa hồ sơ</button>
        </div>

        {/* PHẦN GIỮA: THỐNG KÊ */}
        <div className="profile-stats">
          <div className="stat-item">
            <span className="stat-value">{user.contributionCount}</span>
            <span className="stat-label">Sự kiện đóng góp</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-value">24</span>
            <span className="stat-label">Sự kiện đã lưu</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-value">{user.joinedDate}</span>
            <span className="stat-label">Ngày tham gia</span>
          </div>
        </div>

        {/* PHẦN DƯỚI: DANH SÁCH HOẠT ĐỘNG */}
        <div className="profile-content">
          <h3>Sự kiện bạn đã đóng góp gần đây</h3>
          <div className="empty-state">
            <p>Bạn chưa đóng góp sự kiện nào trong tuần này.</p>
            <Link to="/contribute">
              <button className="contribute-now-btn">Đóng góp ngay</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import "./ProfilePage.css";
import { Link } from "react-router-dom";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("contributed");
  const [user, setUser] = useState({
    name: "Lê Quỳnh Như",
    email: "user@evigo.vn",
    avatar:
      "https://ui-avatars.com/api/?name=User&background=635bff&color=fff&size=128",
    contributionCount: 15, // Số lượng đóng góp thực tế của Như
    savedCount: 24,
    joinedDate: "Tháng 01, 2026",
  });

  // 1. Hệ thống Cấp bậc Đóng góp (Contributor Tiers)
  const getTier = (count) => {
    if (count >= 51)
      return { label: "Huyền Thoại EviGo", class: "tier-legend" };
    if (count >= 31)
      return { label: "Đại Sứ Cộng Đồng", class: "tier-ambassador" };
    if (count >= 16) return { label: "Nhà Thám Hiểm", class: "tier-explorer" };
    if (count >= 6) return { label: "Người Kết Nối", class: "tier-connector" };
    return { label: "Người Khởi Hành", class: "tier-starter" };
  };

  const currentTier = getTier(user.contributionCount);

  // 2. Cập nhật dữ liệu từ localStorage (Lấy email qnhu799@gmail.com)
  useEffect(() => {
    const savedName = localStorage.getItem("username");
    const savedEmail = localStorage.getItem("email"); // Lấy email thật từ Login
    const savedJoinedDate = localStorage.getItem("joinedDate");

    if (savedName) {
      setUser((prev) => ({
        ...prev,
        name: savedName,
        email: savedEmail || prev.email, // Hiển thị đúng qnhu799@gmail.com
        joinedDate: savedJoinedDate || prev.joinedDate,
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
            {/* Badge danh hiệu động */}
            <div className={`rank-badge ${currentTier.class}`}>
              {currentTier.label}
            </div>
          </div>
          <h2 className="profile-name">{user.name}</h2>
          <p className="profile-email">{user.email}</p>
          <button className="edit-btn">Chỉnh sửa hồ sơ</button>
        </div>

        {/* PHẦN GIỮA: THỐNG KÊ (Click để đổi Tab) */}
        <div className="profile-stats">
          <div
            className={`stat-item ${activeTab === "contributed" ? "active-tab" : ""}`}
            onClick={() => setActiveTab("contributed")}
          >
            <span className="stat-value">{user.contributionCount}</span>
            <span className="stat-label">Sự kiện đóng góp</span>
          </div>

          <div className="stat-divider"></div>

          <div
            className={`stat-item ${activeTab === "saved" ? "active-tab" : ""}`}
            onClick={() => setActiveTab("saved")}
          >
            <span className="stat-value">{user.savedCount}</span>
            <span className="stat-label">Sự kiện đã lưu</span>
          </div>

          <div className="stat-divider"></div>

          <div className="stat-item no-click">
            <span className="stat-value">{user.joinedDate}</span>
            <span className="stat-label">Ngày tham gia</span>
          </div>
        </div>

        {/* PHẦN DƯỚI: DANH SÁCH HOẠT ĐỘNG */}
        <div className="profile-content">
          <h3>
            {activeTab === "contributed"
              ? "Sự kiện bạn đã đóng góp gần đây"
              : "Sự kiện bạn đã lưu"}
          </h3>

          <div className="empty-state">
            <p>
              {activeTab === "contributed"
                ? "Bạn chưa đóng góp sự kiện nào trong tuần này."
                : "Bạn chưa lưu sự kiện nào hết Như ơi!"}
            </p>
            {activeTab === "contributed" && (
              <Link to="/contribute">
                <button className="contribute-now-btn">Đóng góp ngay</button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

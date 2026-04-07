import React from "react";
import "./ProfilePage.css";
import { Link } from "react-router-dom";

export default function ProfilePage() {
  // Giả sử đây là dữ liệu từ máy chủ (sau này Như sẽ gọi API)
  const user = {
    name: "Lê Quỳnh Như",
    email: "nhu.le@example.com",
    avatar:
      "https://ui-avatars.com/api/?name=Nhu+Le&background=635bff&color=fff&size=128",
    contributionCount: 15,
    rank: "Sứ giả sự kiện",
    joinedDate: "Tháng 01, 2026",
  };

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

        {/* PHẦN DƯỚI: DANH SÁCH HOẠT ĐỘNG HOẶC SỰ KIỆN */}
        <div className="profile-content">
          <h3>Sự kiện bạn đã đóng góp gần đây</h3>
          <div className="empty-state">
            <p>Bạn chưa đóng góp sự kiện nào trong tuần này.</p>
            {/* Bọc nút bấm bằng Link để dẫn sang trang đóng góp */}
            <Link to="/contribute">
              <button className="contribute-now-btn">Đóng góp ngay</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

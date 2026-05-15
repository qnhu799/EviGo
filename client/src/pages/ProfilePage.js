import React, { useState, useEffect } from "react";
import "./ProfilePage.css";
import { Link } from "react-router-dom";
import axios from "axios";
import EventCard from "./EventCard";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("contributed");
  const [contributedEvents, setContributedEvents] = useState([]);
  const [savedEvents, setSavedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState({
    name: "Lê Quỳnh Như",
    email: "user@evigo.vn",
    avatar:
      "https://ui-avatars.com/api/?name=User&background=635bff&color=fff&size=128",
    contributionCount: 0,
    savedCount: 0,
    joinedDate: "Tháng 01, 2026",
  });

  // 1. Hệ thống Cấp bậc (Giữ nguyên logic của Như)
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

  // 2. Fetch dữ liệu thực tế
  useEffect(() => {
    const fetchData = async () => {
      const savedName = localStorage.getItem("username");
      const savedEmail = localStorage.getItem("email");
      const savedJoinedDate = localStorage.getItem("joinedDate");
      const token = localStorage.getItem("token");

      if (savedName) {
        setUser((prev) => ({
          ...prev,
          name: savedName,
          email: savedEmail || prev.email,
          joinedDate: savedJoinedDate || prev.joinedDate,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(savedName)}&background=635bff&color=fff&size=128&bold=true`,
        }));
      }

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const [resContributed, resSaved] = await Promise.all([
          axios.get("http://localhost:5000/api/events/my-contributions", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/users/saved-events", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setContributedEvents(resContributed.data || []);
        setSavedEvents(resSaved.data || []);

        setUser((prev) => ({
          ...prev,
          contributionCount: resContributed.data?.length || 0,
          savedCount: resSaved.data?.length || 0,
        }));
      } catch (err) {
        console.error("Lỗi lấy danh sách sự kiện:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const currentList =
    activeTab === "contributed" ? contributedEvents : savedEvents;

  return (
    <div className="profile-container">
      <div className="profile-card">
        {/* HEADER */}
        <div className="profile-header">
          <div className="profile-avatar-wrapper">
            <img src={user.avatar} alt="Avatar" className="profile-img" />
            <div className={`rank-badge ${currentTier.class}`}>
              {currentTier.label}
            </div>
          </div>
          <h2 className="profile-name">{user.name}</h2>
          <p className="profile-email">{user.email}</p>
          <button className="edit-btn">Chỉnh sửa hồ sơ</button>
        </div>

        {/* STATS TABS */}
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

        {/* CONTENT LIST */}
        <div className="profile-content">
          <h3>
            {activeTab === "contributed"
              ? "Sự kiện bạn đã đóng góp"
              : "Sự kiện bạn đã lưu"}
          </h3>

          {loading ? (
            <div className="loading-spinner">
              Đang lục tìm kho báu của Như...
            </div>
          ) : currentList.length > 0 ? (
            <div className="profile-events-grid">
              {currentList.map((ev) => (
                <EventCard key={ev._id} event={ev} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>
                {activeTab === "contributed"
                  ? "Bạn chưa đóng góp sự kiện nào hết."
                  : "Chưa có sự kiện nào trong kho lưu trữ của Như."}
              </p>
              {activeTab === "contributed" && (
                <Link to="/contribute">
                  <button className="contribute-now-btn">Đóng góp ngay</button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

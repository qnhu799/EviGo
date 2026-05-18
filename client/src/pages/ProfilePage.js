import React, { useState, useEffect } from "react";
import "./ProfilePage.css";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

export default function ProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
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

  const getShortAddress = (address) => {
    if (!address) return "Chưa cập nhật";
    const parts = address.split(",");
    if (parts.length >= 3) {
      return `${parts[parts.length - 3].trim()}, ${parts[parts.length - 2].trim()}`;
    }
    return address;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const token =
        localStorage.getItem("token") || localStorage.getItem("Token") || "";

      const savedName =
        localStorage.getItem("username") || localStorage.getItem("Username");
      const savedEmail =
        localStorage.getItem("email") || localStorage.getItem("Email");
      const savedJoinedDate = localStorage.getItem("joinedDate");

      const localUserId =
        localStorage.getItem("userId") || localStorage.getItem("id") || "";

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
        const timestamp = new Date().getTime();
        const [resContributed, resSaved] = await Promise.all([
          axios.get(
            `http://localhost:5000/api/events/my-contributions?userId=${localUserId}&t=${timestamp}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          ),
          axios.get(
            `http://localhost:5000/api/events/saved-events-details?userId=${localUserId}&t=${timestamp}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          ),
        ]);

        setContributedEvents(resContributed.data || []);
        setSavedEvents(resSaved.data || []);
        setUser((prev) => ({
          ...prev,
          contributionCount: resContributed.data?.length || 0,
          savedCount: resSaved.data?.length || 0,
        }));
      } catch (err) {
        console.error("Lỗi tải danh sách trang cá nhân:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, location.key]);

  const currentList =
    activeTab === "contributed" ? contributedEvents : savedEvents;

  return (
    <div className="profile-container">
      <div className="profile-card">
        {/* HEADER (ĐÃ BỎ HOÀN TOÀN NÚT CHỈNH SỬA HỒ SƠ) */}
        <div className="profile-header">
          <div className="profile-avatar-wrapper">
            <img src={user.avatar} alt="Avatar" className="profile-img" />
            <div className={`rank-badge ${currentTier.class}`}>
              {currentTier.label}
            </div>
          </div>
          <h2 className="profile-name">{user.name}</h2>
          <p className="profile-email">{user.email}</p>
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
              Đang lục tìm kho
            </div>
          ) : currentList.length > 0 ? (
            <div className="profile-events-list-wrapper">
              {currentList.map((ev, index) => (
                <div
                  key={ev._id}
                  className="profile-event-row-item"
                  onClick={() => navigate(`/event/${ev._id}`)}
                >
                  <div className="row-col-main">
                    <span className="row-index">#{index + 1}</span>
                    <div className="row-title-block">
                      <h4 className="row-event-title">{ev.title}</h4>
                      <span className="row-event-type">
                        {ev.type || "Sự kiện"}
                      </span>
                    </div>
                  </div>
                  <div className="row-col-info">
                    <span className="row-label">📍 Địa điểm</span>
                    <p className="row-value-text">
                      {ev.locations?.[0]?.address
                        ? getShortAddress(ev.locations[0].address)
                        : "Đang cập nhật..."}
                    </p>
                  </div>
                  <div className="row-col-info">
                    <span className="row-label">📅 Thời gian</span>
                    <p className="row-value-text">
                      {ev.startDate
                        ? new Date(ev.startDate).toLocaleDateString("vi-VN")
                        : "Cố định tuần"}
                    </p>
                  </div>
                  <div className="row-col-status">
                    <span
                      className={`status-row-badge ${activeTab === "contributed" ? ev.status || "pending" : "saved"}`}
                    >
                      {activeTab === "contributed"
                        ? ev.status === "approved"
                          ? "✓ Đã duyệt"
                          : ev.status === "rejected"
                            ? "✕ Từ chối"
                            : "● Chờ duyệt"
                        : "🔖 Đã lưu"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>
                {activeTab === "contributed"
                  ? "Bạn chưa đóng góp sự kiện nào hết."
                  : "Chưa có sự kiện nào trong kho lưu trữ"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import "./ProfilePage.css";
import { Link, useNavigate, useLocation } from "react-router-dom"; // 🎯 CẬP NHẬT: Thêm useLocation để bắt sự kiện chuyển trang realtime
import axios from "axios";

export default function ProfilePage() {
  const navigate = useNavigate(); // Kích hoạt điều hướng
  const location = useLocation(); // 🎯 CẬP NHẬT: Kích hoạt bộ lắng nghe thay đổi định tuyến thời gian thực
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

  // 1. Hệ thống Cấp bậc (Giữ nguyên gốc chuẩn chỉnh của Như)
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

  // Hàm bổ trợ thu gọn địa chỉ dài ngoằng cho sạch giao diện bảng
  const getShortAddress = (address) => {
    if (!address) return "Chưa cập nhật";
    const parts = address.split(",");
    if (parts.length >= 3) {
      return `${parts[parts.length - 3].trim()}, ${parts[parts.length - 2].trim()}`;
    }
    return address;
  };

  // 2. Fetch dữ liệu thực tế kết nối đa luồng liên thông Backend (🎯 CẬP NHẬT: Làm mới dữ liệu dứt điểm khi chuyển trang)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Bốc cả token thường lẫn Token hoa để không bị nghẽn tiến trình gọi API
      const token =
        localStorage.getItem("token") || localStorage.getItem("Token") || "";

      const savedName =
        localStorage.getItem("username") || localStorage.getItem("Username");
      const savedEmail =
        localStorage.getItem("email") || localStorage.getItem("Email");
      const savedJoinedDate = localStorage.getItem("joinedDate");

      // BỐC ID CHUỖI TỪ LOCALSTORAGE ĐỂ LÀM THAM SỐ ĐỒNG BỘ ĐA ĐIỂM BẢO HIỂM
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
        console.warn(
          "⚠️ [EviGo] Không tìm thấy Token xác thực trong localStorage!",
        );
        setLoading(false);
        return;
      }

      try {
        // 🎯 CHIẾN THUẬT PHÁ CACHE: Tạo mã thời gian ngẫu nhiên đính vào URL ép Server trả về dữ liệu realtime
        const timestamp = new Date().getTime();

        const [resContributed, resSaved] = await Promise.all([
          // Luồng 1: Lấy các bài đóng góp (Ép header chặn cache 304 cứng đầu)
          axios.get(
            `http://localhost:5000/api/events/my-contributions?userId=${localUserId}&t=${timestamp}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Cache-Control": "no-cache",
                Pragma: "no-cache",
                Expires: "0",
              },
            },
          ),
          // Luồng 2: Đường dẫn bốc ĐẦY ĐỦ CHI TIẾT các bài viết đã lưu
          axios.get(
            `http://localhost:5000/api/events/saved-events-details?userId=${localUserId}&t=${timestamp}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Cache-Control": "no-cache",
                Pragma: "no-cache",
                Expires: "0",
              },
            },
          ),
        ]);

        console.log(
          "✅ Dữ liệu bài đóng góp bốc về thành công:",
          resContributed.data,
        );
        console.log("✅ Dữ liệu bài đã lưu bốc về thành công:", resSaved.data);

        setContributedEvents(resContributed.data || []);
        setSavedEvents(resSaved.data || []);

        setUser((prev) => ({
          ...prev,
          contributionCount: resContributed.data?.length || 0,
          savedCount: resSaved.data?.length || 0,
        }));
      } catch (err) {
        console.error(
          "❌ Lỗi truy xuất danh sách sự kiện tại trang cá nhân:",
          err.response?.data || err.message,
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, location.key]); // 🎯 CẬP NHẬT CHÍ MẠNG: Lắng nghe location.key để ép buộc kích hoạt re-fetch bài tươi khi định tuyến thay đổi

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
            /* 🎯 CẤU TRÚC DANH SÁCH ROW HÀNG NGANG PHẲNG TINH GIẢN */
            <div className="profile-events-list-wrapper">
              {currentList.map((ev, index) => {
                const mainLocation = ev.locations?.[0];
                return (
                  <div
                    key={ev._id}
                    className="profile-event-row-item"
                    onClick={() => navigate(`/event/${ev._id}`)}
                  >
                    {/* Cột 1: Số thứ tự & Tiêu đề kèm Tag thể loại */}
                    <div className="row-col-main">
                      <span className="row-index">#{index + 1}</span>
                      <div className="row-title-block">
                        <h4 className="row-event-title">{ev.title}</h4>
                        <span className="row-event-type">
                          {ev.type || "Sự kiện"}
                        </span>
                      </div>
                    </div>

                    {/* Cột 2: Địa điểm tinh giản */}
                    <div className="row-col-info">
                      <span className="row-label">📍 Địa điểm</span>
                      <p className="row-value-text">
                        {mainLocation?.address
                          ? getShortAddress(mainLocation.address)
                          : "Đang cập nhật..."}
                      </p>
                    </div>

                    {/* Cột 3: Ngày tổ chức */}
                    <div className="row-col-info">
                      <span className="row-label">📅 Thời gian</span>
                      <p className="row-value-text">
                        {ev.startDate
                          ? new Date(ev.startDate).toLocaleDateString("vi-VN")
                          : "Cố định tuần"}
                      </p>
                    </div>

                    {/* Cột 4: Badge trạng thái phẳng phẳng dẹt */}
                    <div className="row-col-status">
                      {activeTab === "contributed" ? (
                        <span
                          className={`status-row-badge ${ev.status || "pending"}`}
                        >
                          {ev.status === "approved" || ev.status === "Approved"
                            ? "✓ Đã duyệt"
                            : ev.status === "rejected" ||
                                ev.status === "Rejected"
                              ? "✕ Từ chối"
                              : "● Chờ duyệt"}
                        </span>
                      ) : (
                        <span className="status-row-badge saved">
                          🔖 Đã lưu
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
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

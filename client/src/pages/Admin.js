import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Admin.css";
import Swal from "sweetalert2";

const Admin = () => {
  const [displayedEvents, setDisplayedEvents] = useState([]); // Danh sách hiển thị theo tab
  const [filterStatus, setFilterStatus] = useState("pending");
  const [approvedCount, setApprovedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Hàm tiện ích để lấy token (Chống lỗi lệch chữ Token viết hoa / viết thường)
  const getValidToken = () => {
    return localStorage.getItem("token") || localStorage.getItem("Token") || "";
  };

  // 1. Lấy thống kê số lượng (Đếm cá nhân cho Xanh/Đỏ, đếm Chung cho Tím)
  const fetchStats = async () => {
    try {
      const token = getValidToken();
      if (!token) {
        console.warn("⚠️ Không tìm thấy Token trong LocalStorage!");
        return;
      }

      const response = await axios.get(
        "http://localhost:5000/api/events/stats",
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setApprovedCount(response.data.approvedCount || 0);
      setRejectedCount(response.data.rejectedCount || 0);
      setPendingCount(response.data.pendingCount || 0);
    } catch (error) {
      console.error("❌ Lỗi thống kê:", error.response?.data || error.message);
    }
  };

  // 2. Lấy danh sách sự kiện theo Status (🎯 ĐỂ KHỚP LOGIC CÁ NHÂN HÓA)
  const fetchEventsByStatus = async (status) => {
    setLoading(true);
    try {
      const token = getValidToken();
      if (!token) {
        setDisplayedEvents([]);
        return;
      }

      // Gọi API mới để lấy bài: Pending (Tất cả) | Approved/Rejected (Của tôi)
      const response = await axios.get(
        `http://localhost:5000/api/events/admin-list?status=${status}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setDisplayedEvents(response.data || []);
    } catch (error) {
      console.error(
        "❌ Lỗi lấy danh sách sự kiện:",
        error.response?.data || error.message,
      );
      setDisplayedEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật dữ liệu khi đổi Tab hoặc khi vừa vào trang
  useEffect(() => {
    fetchEventsByStatus(filterStatus);
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus]);

  const handleApprove = async (id) => {
    try {
      const token = getValidToken();
      await axios.patch(
        `http://localhost:5000/api/events/update-status/${id}`,
        { status: "approved" },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      Swal.fire({
        title: "Tuyệt vời!",
        text: "Sự kiện đã được duyệt ✨",
        icon: "success",
        confirmButtonColor: "#635bff",
        timer: 2000,
      });
      fetchEventsByStatus(filterStatus);
      fetchStats();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Lỗi rồi...",
        text: "Không thể duyệt lúc này!",
      });
    }
  };

  const handleReject = async (id) => {
    try {
      const token = getValidToken();
      await axios.patch(
        `http://localhost:5000/api/events/update-status/${id}`,
        { status: "rejected" },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      Swal.fire({
        title: "Đã từ chối",
        text: "Hệ thống đã hủy sự kiện này.",
        icon: "info",
        confirmButtonColor: "#ff4d4d",
      });
      fetchEventsByStatus(filterStatus);
      fetchStats();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Lỗi hệ thống",
        text: "Trục trặc khi hủy bài!",
      });
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-card">
        <h1 className="admin-title">Hệ thống Quản trị EviGo</h1>

        <div className="admin-stats">
          <div
            className={`stat-card purple ${filterStatus === "pending" ? "active-filter" : ""}`}
            onClick={() => setFilterStatus("pending")}
          >
            <h3>{pendingCount}</h3>
            <p>Sự kiện mới (Chung)</p>
          </div>
          <div
            className={`stat-card green ${filterStatus === "approved" ? "active-filter" : ""}`}
            onClick={() => setFilterStatus("approved")}
          >
            <h3>{approvedCount}</h3>
            <p>Bạn đã duyệt (Riêng)</p>
          </div>
          <div
            className={`stat-card red ${filterStatus === "rejected" ? "active-filter" : ""}`}
            onClick={() => setFilterStatus("rejected")}
          >
            <h3>{rejectedCount}</h3>
            <p>Bạn đã hủy (Riêng)</p>
          </div>
        </div>

        <div className="admin-table-section">
          <h3 className="table-caption">
            Danh sách{" "}
            {filterStatus === "pending"
              ? "chờ phê duyệt"
              : filterStatus === "approved"
                ? "bạn đã duyệt"
                : "bạn đã hủy"}
          </h3>

          {loading ? (
            <div style={{ textAlign: "center", padding: "20px" }}>
              Đang tải dữ liệu...
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>SỰ KIỆN</th>
                  <th>NGƯỜI ĐĂNG</th>
                  <th>ĐỊA CHỈ & QUẬN</th>
                  <th>THỜI GIAN</th>
                  <th>GIÁ VÉ</th>
                  <th>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {displayedEvents.length > 0 ? (
                  displayedEvents.map((event) => {
                    // 🎯 BỘ LỌC KIỂM TRA 3 LỚP: Chống hiển thị chữ "Ẩn danh" khi Backend rỗng chuỗi
                    const rawInfoName =
                      event.contributorInfo?.displayName ||
                      event.contributorInfo?.username;
                    const rawContrName = event.contributorName;
                    const savedLocalName =
                      localStorage.getItem("username") ||
                      localStorage.getItem("Username");

                    let finalDisplayName = "Cộng tác viên EviGo";

                    if (
                      typeof rawInfoName === "string" &&
                      rawInfoName.trim().length > 0 &&
                      rawInfoName !== "Ẩn danh"
                    ) {
                      finalDisplayName = rawInfoName;
                    } else if (
                      typeof rawContrName === "string" &&
                      rawContrName.trim().length > 0 &&
                      rawContrName !== "Ẩn danh"
                    ) {
                      finalDisplayName = rawContrName;
                    } else if (savedLocalName) {
                      finalDisplayName = savedLocalName; // Phương án dự phòng tự động nhận diện tài khoản em
                    }

                    return (
                      <tr key={event._id}>
                        <td>
                          <a
                            href={`/event/${event._id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="event-link-title"
                          >
                            {event.title || event.name || "Không có tên"}
                          </a>
                          <span className="event-type-badge">{event.type}</span>
                        </td>
                        <td>
                          <div className="contributor-box">
                            <div className="avatar-small">
                              {finalDisplayName.charAt(0).toUpperCase()}
                            </div>
                            <span>{finalDisplayName}</span>
                          </div>
                        </td>
                        <td>
                          <div className="district-text">
                            {event.locations?.[0]?.district || "---"}
                          </div>
                          <small className="address-text">
                            {event.locations?.[0]?.address || "---"}
                          </small>
                        </td>
                        <td>
                          {event.isPermanent ? (
                            <span className="permanent-tag">Cố định</span>
                          ) : event.startDate ? (
                            new Date(event.startDate).toLocaleDateString(
                              "vi-VN",
                            )
                          ) : (
                            "---"
                          )}
                        </td>
                        <td className="price-tag">
                          {event.ticketPrice || "Miễn phí"}
                        </td>
                        <td>
                          {event.status === "pending" ? (
                            <div className="action-btns">
                              <button
                                className="btn-approve"
                                onClick={() => handleApprove(event._id)}
                              >
                                Duyệt
                              </button>
                              <button
                                className="btn-reject"
                                onClick={() => handleReject(event._id)}
                              >
                                Hủy
                              </button>
                            </div>
                          ) : (
                            <span className="status-processed-text">
                              {event.status === "approved"
                                ? "✅ Đã lên sàn"
                                : "❌ Đã từ chối"}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      style={{ textAlign: "center", padding: "30px" }}
                    >
                      <p className="empty-message">
                        Không có sự kiện nào trong danh mục này! 🌸
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;

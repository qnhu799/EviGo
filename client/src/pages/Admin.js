import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Admin.css";
import Swal from "sweetalert2";

const Admin = () => {
  const [allEvents, setAllEvents] = useState([]);
  const [filterStatus, setFilterStatus] = useState("pending");
  const [approvedCount, setApprovedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  // 1. Lấy thống kê số lượng
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/events/stats",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setApprovedCount(response.data.approvedCount || 0);
      setRejectedCount(response.data.rejectedCount || 0);
      // Cập nhật luôn pendingCount từ stats nếu có
      if (response.data.pendingCount !== undefined) {
        setPendingCount(response.data.pendingCount);
      }
    } catch (error) {
      console.error("Lỗi thống kê:", error);
    }
  };

  // 2. Lấy toàn bộ danh sách sự kiện
  const fetchAllEvents = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/events/all-for-admin",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const data = response.data || [];
      setAllEvents(data);

      // Đếm số lượng chờ duyệt thực tế từ mảng trả về
      const pending = data.filter((ev) => ev.status === "pending").length;
      setPendingCount(pending);
    } catch (error) {
      console.error("Lỗi lấy danh sách sự kiện:", error);
      // Nếu lỗi 500, đảm bảo mảng không bị undefined gây crash map()
      setAllEvents([]);
    }
  };

  useEffect(() => {
    fetchAllEvents();
    fetchStats();
  }, []);

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem("token");
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
      fetchAllEvents();
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
      const token = localStorage.getItem("token");
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
      fetchAllEvents();
      fetchStats();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Lỗi hệ thống",
        text: "Trục trặc khi hủy bài!",
      });
    }
  };

  // Lọc danh sách hiển thị an toàn
  const displayedEvents = (allEvents || []).filter(
    (ev) => ev && ev.status === filterStatus,
  );

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
            <p>Sự kiện mới</p>
          </div>
          <div
            className={`stat-card green ${filterStatus === "approved" ? "active-filter" : ""}`}
            onClick={() => setFilterStatus("approved")}
          >
            <h3>{approvedCount}</h3>
            <p>Bạn đã duyệt</p>
          </div>
          <div
            className={`stat-card red ${filterStatus === "rejected" ? "active-filter" : ""}`}
            onClick={() => setFilterStatus("rejected")}
          >
            <h3>{rejectedCount}</h3>
            <p>Đã hủy</p>
          </div>
        </div>

        <div className="admin-table-section">
          <h3 className="table-caption">
            Danh sách{" "}
            {filterStatus === "pending"
              ? "chờ phê duyệt"
              : filterStatus === "approved"
                ? "đã duyệt"
                : "đã hủy"}
          </h3>

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
                displayedEvents.map((event) => (
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
                          {(event.contributor?.displayName || "U")
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <span>
                          {event.contributor?.displayName || "Ẩn danh"}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="district-text">
                        {event.locations?.[0]?.district ||
                          event.district ||
                          "---"}
                      </div>
                      <small className="address-text">
                        {event.locations?.[0]?.address || "---"}
                      </small>
                    </td>
                    <td>
                      {event.isPermanent ? (
                        <span className="permanent-tag">Cố định</span>
                      ) : event.startDate ? (
                        new Date(event.startDate).toLocaleDateString("vi-VN")
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
                ))
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
        </div>
      </div>
    </div>
  );
};

export default Admin;

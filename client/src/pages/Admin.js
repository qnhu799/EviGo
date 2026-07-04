import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Admin.css";
import Swal from "sweetalert2";

const Admin = () => {
  const [displayedEvents, setDisplayedEvents] = useState([]);
  const [filterStatus, setFilterStatus] = useState("pending");
  const [approvedCount, setApprovedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const getValidToken = () => {
    return localStorage.getItem("token") || localStorage.getItem("Token") || "";
  };

  const fetchStats = async () => {
    try {
      const token = getValidToken();
      if (!token) {
        console.warn("⚠️ Không tìm thấy Token trong LocalStorage!");
        return;
      }

      const response = await axios.get("/api/events/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setApprovedCount(response.data.approvedCount || 0);
      setRejectedCount(response.data.rejectedCount || 0);
      setPendingCount(response.data.pendingCount || 0);
    } catch (error) {
      console.error("❌ Lỗi thống kê:", error.response?.data || error.message);
    }
  };

  const fetchEventsByStatus = async (status) => {
    setLoading(true);
    try {
      const token = getValidToken();
      if (!token) {
        setDisplayedEvents([]);
        return;
      }

      const response = await axios.get(
        `/api/events/admin-list?status=${status}`,
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

  useEffect(() => {
    fetchEventsByStatus(filterStatus);
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus]);

  const handleApprove = async (id) => {
    try {
      const token = getValidToken();
      await axios.patch(
        `/api/events/update-status/${id}`,
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
        `/api/events/update-status/${id}`,
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
            <p>Bạn đã hủy</p>
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
                    const nameFromContributor =
                      event.contributor?.displayName || event.contributor?.name;
                    const nameFromContrName = event.contributorName;
                    const nameFromInfo =
                      event.contributorInfo?.displayName ||
                      event.contributorInfo?.username;

                    let finalDisplayName = "User EviGo";

                    if (
                      typeof nameFromContributor === "string" &&
                      nameFromContributor.trim().length > 0 &&
                      nameFromContributor !== "Cộng tác viên" &&
                      nameFromContributor !== "Ẩn danh"
                    ) {
                      finalDisplayName = nameFromContributor;
                    } else if (
                      typeof nameFromContrName === "string" &&
                      nameFromContrName.trim().length > 0 &&
                      nameFromContrName !== "Ẩn danh"
                    ) {
                      finalDisplayName = nameFromContrName;
                    } else if (
                      typeof nameFromInfo === "string" &&
                      nameFromInfo.trim().length > 0 &&
                      nameFromInfo !== "Người dùng ẩn danh"
                    ) {
                      finalDisplayName = nameFromInfo;
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

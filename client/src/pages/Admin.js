import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Admin.css";
// 1. Import SweetAlert2
import Swal from "sweetalert2";

const Admin = () => {
  const [pendingEvents, setPendingEvents] = useState([]);
  const [approvedCount, setApprovedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);

  // Hàm lấy thống kê số lượng bài duyệt của riêng Admin này
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/events/stats",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setApprovedCount(response.data.approvedCount);
      setRejectedCount(response.data.rejectedCount);
    } catch (error) {
      console.error("Lỗi khi lấy thống kê admin:", error);
    }
  };

  const fetchPendingEvents = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/events/pending",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setPendingEvents(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách chờ duyệt:", error);
    }
  };

  useEffect(() => {
    fetchPendingEvents();
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
        text: "Sự kiện đã được duyệt và ghi nhận vào tài khoản của bạn ✨",
        icon: "success",
        confirmButtonColor: "#635bff",
        timer: 2000,
      });

      fetchPendingEvents();
      fetchStats();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Lỗi rồi...",
        text: "Không thể duyệt sự kiện lúc này Như ơi!",
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
        text: "Hệ thống đã ghi nhận việc hủy sự kiện này.",
        icon: "info",
        confirmButtonColor: "#ff4d4d",
      });

      fetchPendingEvents();
      fetchStats();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Lỗi hệ thống",
        text: "Có chút trục trặc khi từ chối rồi!",
      });
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-card">
        <h1 className="admin-title">Hệ thống Quản trị EviGo</h1>

        <div className="admin-stats">
          <div className="stat-card purple">
            <h3>{pendingEvents.length}</h3>
            <p>Sự kiện mới</p>
          </div>

          <div className="stat-card green">
            <h3>{approvedCount}</h3>
            <p>Bạn đã duyệt</p>
          </div>

          <div className="stat-card red">
            <h3>{rejectedCount}</h3>
            <p>Đã hủy</p>
          </div>
        </div>

        <div className="admin-table-section">
          <h3 className="table-caption">Danh sách chờ phê duyệt</h3>
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: "22%" }}>SỰ KIỆN</th>
                <th style={{ width: "16%" }}>NGƯỜI ĐĂNG</th>
                <th style={{ width: "18%" }}>ĐỊA CHỈ & QUẬN</th>
                <th style={{ width: "12%" }}>THỜI GIAN</th>
                <th style={{ width: "10%" }}>GIÁ VÉ</th>
                <th style={{ width: "22%" }}>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {pendingEvents.map((event) => (
                <tr key={event._id}>
                  <td>
                    <a
                      href={`/event/${event._id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Nhấn để xem trước nội dung chi tiết"
                      style={{
                        textDecoration: "none",
                        color: "#280d8c",
                        fontWeight: "800",
                        fontSize: "14px",
                        display: "block",
                        marginBottom: "4px",
                      }}
                    >
                      {event.title}
                    </a>
                    <span
                      style={{
                        background: "#f0efff",
                        padding: "2px 5px",
                        borderRadius: "4px",
                        fontSize: "11px",
                        color: "#6b7280",
                      }}
                    >
                      {event.type}
                    </span>
                  </td>

                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <div
                        style={{
                          width: "26px",
                          height: "26px",
                          borderRadius: "50%",
                          background: "#635bff",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "11px",
                          fontWeight: "bold",
                        }}
                      >
                        {event.creatorName
                          ? event.creatorName.charAt(0).toUpperCase()
                          : "U"}
                      </div>
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: "600",
                          color: "#4b5563",
                        }}
                      >
                        {event.creatorName || "Ẩn danh"}
                      </span>
                    </div>
                  </td>

                  <td>
                    <div style={{ fontWeight: "600", fontSize: "13px" }}>
                      {event.district ||
                        (event.locations && event.locations[0]?.district)}
                    </div>
                    <small style={{ color: "#6b7280", fontSize: "11px" }}>
                      {event.locations?.[0]?.address}
                    </small>
                  </td>

                  <td style={{ fontSize: "13px", fontWeight: "500" }}>
                    {event.isPermanent ? (
                      <span style={{ color: "#635bff" }}>Cố định</span>
                    ) : event.startDate ? (
                      new Date(event.startDate).toLocaleDateString("vi-VN")
                    ) : (
                      "---"
                    )}
                  </td>

                  <td>
                    <span
                      style={{
                        color: "#10b981",
                        fontWeight: "700",
                        fontSize: "13px",
                      }}
                    >
                      {event.ticketPrice || "Free"}
                    </span>
                  </td>

                  <td>
                    <div
                      className="action-btns"
                      style={{
                        display: "flex",
                        gap: "6px",
                        alignItems: "center",
                      }}
                    >
                      <button
                        className="btn-approve"
                        style={{ padding: "6px 10px" }}
                        onClick={() => handleApprove(event._id)}
                      >
                        Duyệt
                      </button>
                      <button
                        className="btn-reject"
                        style={{ padding: "6px 10px" }}
                        onClick={() => handleReject(event._id)}
                      >
                        Hủy
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {pendingEvents.length === 0 && (
            <p
              style={{
                textAlign: "center",
                marginTop: "20px",
                color: "#6b7280",
              }}
            >
              Không có sự kiện nào đang chờ duyệt.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;

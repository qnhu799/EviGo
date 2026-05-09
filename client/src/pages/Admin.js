import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Admin.css";
// 1. Import SweetAlert2
import Swal from "sweetalert2";

const Admin = () => {
  const [allEvents, setAllEvents] = useState([]); // Chứa tất cả sự kiện lấy từ API
  const [filterStatus, setFilterStatus] = useState("pending"); // Mặc định lọc sự kiện "Chờ duyệt"
  const [approvedCount, setApprovedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

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

  // Hàm lấy toàn bộ danh sách sự kiện (để có thể lọc theo 3 trạng thái)
  const fetchAllEvents = async () => {
    try {
      const token = localStorage.getItem("token");
      // Gọi API lấy toàn bộ sự kiện để lọc ở client
      const response = await axios.get(
        "http://localhost:5000/api/events/all-for-admin",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setAllEvents(response.data);
      // Đếm số lượng chờ duyệt cho thẻ màu tím
      const pending = response.data.filter(
        (ev) => ev.status === "pending",
      ).length;
      setPendingCount(pending);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách sự kiện:", error);
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
        text: "Sự kiện đã được duyệt và ghi nhận vào tài khoản của bạn ✨",
        icon: "success",
        confirmButtonColor: "#635bff",
        timer: 2000,
      });

      // CẬP NHẬT LẠI DỮ LIỆU NGAY LẬP TỨC
      fetchAllEvents();
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

      // CẬP NHẬT LẠI DỮ LIỆU NGAY LẬP TỨC
      fetchAllEvents();
      fetchStats();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Lỗi hệ thống",
        text: "Có chút trục trặc khi từ chối rồi!",
      });
    }
  };

  // LOGIC LỌC: Lọc danh sách hiển thị dựa trên nút admin bấm vào
  const displayedEvents = allEvents.filter((ev) => ev.status === filterStatus);

  return (
    <div className="admin-container">
      <div className="admin-card">
        <h1 className="admin-title">Hệ thống Quản trị EviGo</h1>

        <div className="admin-stats">
          {/* Nút Sự kiện mới - Tím */}
          <div
            className={`stat-card purple ${filterStatus === "pending" ? "active-filter" : ""}`}
            onClick={() => setFilterStatus("pending")}
            style={{ cursor: "pointer" }}
          >
            <h3>{pendingCount}</h3>
            <p>Sự kiện mới</p>
          </div>

          {/* Nút Đã duyệt - Xanh */}
          <div
            className={`stat-card green ${filterStatus === "approved" ? "active-filter" : ""}`}
            onClick={() => setFilterStatus("approved")}
            style={{ cursor: "pointer" }}
          >
            <h3>{approvedCount}</h3>
            <p>Bạn đã duyệt</p>
          </div>

          {/* Nút Đã hủy - Đỏ */}
          <div
            className={`stat-card red ${filterStatus === "rejected" ? "active-filter" : ""}`}
            onClick={() => setFilterStatus("rejected")}
            style={{ cursor: "pointer" }}
          >
            <h3>{rejectedCount}</h3>
            <p>Đã hủy</p>
          </div>
        </div>

        <div className="admin-table-section">
          <h3 className="table-caption">
            {filterStatus === "pending" && "Danh sách chờ phê duyệt"}
            {filterStatus === "approved" && "Danh sách sự kiện đã duyệt"}
            {filterStatus === "rejected" && "Danh sách sự kiện đã hủy"}
          </h3>

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
              {displayedEvents.map((event) => (
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
                      {event.ticketPrice || "Miễn phí"}
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
                      {event.status === "pending" ? (
                        <>
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
                        </>
                      ) : (
                        <span
                          style={{
                            fontSize: "12px",
                            fontStyle: "italic",
                            color: "#9ca3af",
                          }}
                        >
                          Đã xử lý
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {displayedEvents.length === 0 && (
            <p
              style={{
                textAlign: "center",
                marginTop: "20px",
                color: "#6b7280",
              }}
            >
              Không có sự kiện nào trong danh mục này.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;

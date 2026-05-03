import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Admin.css";
// 1. Import SweetAlert2
import Swal from "sweetalert2";

const Admin = () => {
  const [pendingEvents, setPendingEvents] = useState([]);
  const [approvedCount, setApprovedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);

  const fetchPendingEvents = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/events/pending",
      );
      setPendingEvents(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách admin:", error);
    }
  };

  useEffect(() => {
    fetchPendingEvents();
  }, []);

  const handleApprove = async (id) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/events/update-status/${id}`,
        { status: "approved" },
      );

      setApprovedCount((prev) => prev + 1);

      // 2. Thông báo Duyệt thành công hiện trên màn hình
      Swal.fire({
        title: "Tuyệt vời!",
        text: "Sự kiện đã được duyệt và ghim lên bản đồ EviGo ✨",
        icon: "success",
        confirmButtonColor: "#635bff",
        timer: 2000
      });

      fetchPendingEvents();
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
      await axios.patch(
        `http://localhost:5000/api/events/update-status/${id}`,
        { status: "rejected" },
      );

      setRejectedCount((prev) => prev + 1);

      // 3. Thông báo Hủy thành công hiện trên màn hình
      Swal.fire({
        title: "Đã từ chối",
        text: "Hệ thống đã ghi nhận việc hủy sự kiện này.",
        icon: "info",
        confirmButtonColor: "#ff4d4d",
      });

      fetchPendingEvents();
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
            <p>Đã duyệt</p>
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
                <th>Tên sự kiện</th>
                <th>Địa chỉ / Quận</th>
                <th>Ngày diễn ra</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {pendingEvents.map((event) => (
                <tr key={event._id}>
                  <td>
                    <strong>{event.title}</strong>
                    <br />
                    <small>{event.type}</small>
                  </td>
                  <td>{event.district}</td>
                  <td>{new Date(event.date).toLocaleDateString("vi-VN")}</td>
                  <td>
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {pendingEvents.length === 0 && (
            <p style={{ textAlign: "center", marginTop: "20px" }}>
              Không có sự kiện nào đang chờ duyệt.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
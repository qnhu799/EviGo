import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Admin.css";

const Admin = () => {
  const [pendingEvents, setPendingEvents] = useState([]);
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
        {
          status: "approved",
        },
      );
      alert("Duyệt thành công! Ghim sẽ hiện lên bản đồ ✨");
      fetchPendingEvents();
    } catch (error) {
      alert("Lỗi khi duyệt rồi!");
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
            <h3>150</h3>
            <p>Đã xuất bản</p>
          </div>
          <div className="stat-card red">
            <h3>5</h3>
            <p>Cần xử lý gấp</p>
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
                      <button className="btn-reject">Từ chối</button>
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

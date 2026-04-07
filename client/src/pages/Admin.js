import React from "react";
import "./Admin.css";

const Admin = () => {
  const pendingEvents = [
    {
      id: 1,
      name: "Lễ hội Ánh sáng",
      user: "Như Lê",
      date: "26/03/2026",
      type: "Âm nhạc",
    },
    {
      id: 2,
      name: "Triển lãm Tech 2026",
      user: "Thành Nam",
      date: "30/03/2026",
      type: "Công nghệ",
    },
  ];

  return (
    <div className="admin-container">
      <div className="admin-card">
        <h1 className="admin-title">Hệ thống Quản trị EviGo</h1>

        {/* Khối thống kê tổng quan */}
        <div className="admin-stats">
          <div className="stat-card purple">
            <h3>12</h3>
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

        {/* Bảng danh sách phê duyệt */}
        <div className="admin-table-section">
          <h3 className="table-caption">Danh sách chờ phê duyệt</h3>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tên sự kiện</th>
                <th>Người đóng góp</th>
                <th>Ngày diễn ra</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {pendingEvents.map((event) => (
                <tr key={event.id}>
                  <td>
                    <strong>{event.name}</strong>
                    <br />
                    <small>{event.type}</small>
                  </td>
                  <td>{event.user}</td>
                  <td>{event.date}</td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-approve">Duyệt</button>
                      <button className="btn-reject">Từ chối</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Admin;

import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/all-users");
      setUsers(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Lỗi truy cập hệ thống:", err);
      toast.error("Không thể tải danh sách thành viên!");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleConfirmAction = (user) => {
    const isPromoting = user.role !== "admin";
    const themeColor = isPromoting ? "#635bff" : "#d33";

    Swal.fire({
      title: "Xác nhận thao tác?",
      text: `Bạn có chắc muốn ${isPromoting ? "CẤP QUYỀN ADMIN" : "HỦY QUYỀN ADMIN"} của Evier "${user.username}" không?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Đồng ý",
      cancelButtonText: "Hủy bỏ",
      confirmButtonColor: themeColor,
      cancelButtonColor: "#888",
      borderRadius: "15px",

      didOpen: () => {
        const confirmBtn = Swal.getConfirmButton();
        if (confirmBtn) {
          confirmBtn.style.setProperty(
            "background-color",
            themeColor,
            "important",
          );
          confirmBtn.style.setProperty("border-color", themeColor, "important");
          confirmBtn.style.setProperty("box-shadow", "none", "important");

          confirmBtn.onmouseenter = () => {
            confirmBtn.style.setProperty(
              "filter",
              "brightness(1.1)",
              "important",
            );
          };
          confirmBtn.onmouseleave = () => {
            confirmBtn.style.setProperty(
              "filter",
              "brightness(1)",
              "important",
            );
          };
        }

        const cancelBtn = Swal.getCancelButton();
        if (cancelBtn) {
          cancelBtn.style.setProperty("background-color", "#888", "important");
          cancelBtn.onmouseenter = () => {
            cancelBtn.style.setProperty(
              "background-color",
              "#ff4d4f",
              "important",
            );
          };
          cancelBtn.onmouseleave = () => {
            cancelBtn.style.setProperty(
              "background-color",
              "#888",
              "important",
            );
          };
        }
      },
    }).then((result) => {
      if (result.isConfirmed) {
        handleToggleRole(user._id);
      }
    });
  };

  const handleToggleRole = async (userId) => {
    setProcessingId(userId);
    try {
      const res = await axios.put("http://localhost:5000/api/update-role", {
        userId,
      });

      toast.success(res.data.message, {
        icon: "🛡️",
        duration: 3000,
      });

      await fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Cập nhật thất bại!");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h2>Quản lý Thành viên EviGo 🛡️</h2>
        <p>Chào mừng Super Admin quay trở lại bản doanh!</p>
      </header>

      {loading ? (
        <div className="loader">Đang tải dữ liệu hệ thống...</div>
      ) : (
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên Evier</th>
                <th>Email</th>
                <th>Chức vụ (Role)</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr
                    key={user._id}
                    style={{
                      opacity: processingId === user._id ? 0.5 : 1,
                      transition: "0.3s",
                    }}
                  >
                    <td>{user._id.slice(-5)}...</td>
                    <td>
                      <strong>{user.username}</strong>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${user.role}`}>
                        {(user.role || "USER").toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {user.email !== "qnhu799@gmail.com" ? (
                        <button
                          disabled={processingId === user._id}
                          className={`btn-action ${user.role === "admin" ? "delete" : "edit"}`}
                          onClick={() => handleConfirmAction(user)}
                        >
                          {processingId === user._id
                            ? "Đang lưu..."
                            : user.role === "admin"
                              ? "Hủy cấp quyền"
                              : "Cấp quyền Admin"}
                        </button>
                      ) : (
                        <span className="owner-tag">Chủ sở hữu</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="empty-table">
                    Chưa có Evier nào gia nhập hệ thống.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

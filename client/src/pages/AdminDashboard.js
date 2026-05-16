import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]); // Kho lưu trữ gốc tất cả thành viên
  const [filteredUsers, setFilteredUsers] = useState([]); // Danh sách thành viên sau khi lọc
  const [userFilter, setUserFilter] = useState("all"); // Trạng thái phễu lọc thành viên (all, superadmin, admin, user)

  const [allEvents, setAllEvents] = useState([]); // Kho lưu trữ gốc tất cả sự kiện
  const [filteredEvents, setFilteredEvents] = useState([]); // Danh sách sự kiện sau khi qua phễu lọc
  const [eventFilter, setEventFilter] = useState("all"); // Trạng thái phễu lọc sự kiện (all, pending, approved, rejected)

  const [loading, setLoading] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [processingEventId, setProcessingEventId] = useState(null);

  // Hàm lấy token từ bộ nhớ local máy khách
  const getValidToken = () => {
    return localStorage.getItem("token") || localStorage.getItem("Token") || "";
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/auth/all-users",
      );
      setUsers(response.data || []);
      setFilteredUsers(response.data || []); // Mặc định vừa vào thì hiện tất cả
    } catch (err) {
      console.error("Lỗi truy cập hệ thống:", err);
      toast.error("Không thể tải danh sách thành viên!");
    }
  };

  // 2. Hàm lấy TẤT CẢ sự kiện (Hợp nhất đa luồng bảo hiểm)
  const fetchAllEvents = async () => {
    setLoadingEvents(true);
    try {
      const token = getValidToken();

      const response = await axios.get(
        "http://localhost:5000/api/events/all-admin",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data && response.data.length > 0) {
        setAllEvents(response.data);
        setFilteredEvents(response.data);
      } else {
        throw new Error("API all-admin trống hoặc vướng auth");
      }
    } catch (err) {
      console.warn(
        "⚠️ API all-admin vướng Token, tự động kích hoạt luồng gộp dữ liệu đa trạng thái...",
      );
      try {
        const token = getValidToken();
        const headers = { headers: { Authorization: `Bearer ${token}` } };

        const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
          axios
            .get("http://localhost:5000/api/events/pending", headers)
            .catch(() => ({ data: [] })),
          axios
            .get("http://localhost:5000/api/events/approved")
            .catch(() => ({ data: [] })),
          axios
            .get(
              "http://localhost:5000/api/events/admin-list?status=rejected",
              headers,
            )
            .catch(() => ({ data: [] })),
        ]);

        const pendingList = Array.isArray(pendingRes.data)
          ? pendingRes.data
          : [];
        const approvedList = Array.isArray(approvedRes.data)
          ? approvedRes.data
          : [];
        const rejectedList = Array.isArray(rejectedRes.data)
          ? rejectedRes.data
          : [];

        const mergedEvents = [...pendingList, ...approvedList, ...rejectedList];

        const uniqueEvents = mergedEvents.filter(
          (event, index, self) =>
            self.findIndex((e) => e._id === event._id) === index,
        );

        uniqueEvents.sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
        );

        setAllEvents(uniqueEvents);
        setFilteredEvents(uniqueEvents);
      } catch (fallbackErr) {
        console.error("Lỗi luồng dự phòng tổng hợp:", fallbackErr);
        toast.error("Không thể tải kho dữ liệu sự kiện!");
      }
    } finally {
      setLoadingEvents(false);
    }
  };

  // Logic phễu lọc THÀNH VIÊN tự động kích hoạt khi đổi tab chọn
  useEffect(() => {
    if (userFilter === "all") {
      setFilteredUsers(users);
    } else {
      const result = users.filter(
        (user) => String(user.role).toLowerCase() === userFilter.toLowerCase(),
      );
      setFilteredUsers(result);
    }
  }, [userFilter, users]);

  // Logic phễu lọc SỰ KIỆN tự động kích hoạt khi đổi tab chọn
  useEffect(() => {
    if (eventFilter === "all") {
      setFilteredEvents(allEvents);
    } else {
      const result = allEvents.filter((event) => event.status === eventFilter);
      setFilteredEvents(result);
    }
  }, [eventFilter, allEvents]);

  // Khởi chạy nạp dữ liệu hệ thống khi load trang
  useEffect(() => {
    const loadSystemData = async () => {
      setLoading(true);
      await Promise.all([fetchUsers(), fetchAllEvents()]);
      setLoading(false);
    };
    loadSystemData();
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
    }).then((result) => {
      if (result.isConfirmed) {
        handleToggleRole(user._id);
      }
    });
  };

  const handleToggleRole = async (userId) => {
    setProcessingId(userId);
    try {
      const res = await axios.put(
        "http://localhost:5000/api/auth/update-role",
        { userId },
      );

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

  const handleDeleteEvent = async (eventId, eventTitle) => {
    Swal.fire({
      title: "Bạn chắc chắn chứ?",
      text: `Sự kiện "${eventTitle || "Không tên"}" sẽ bị xóa vĩnh viễn khỏi Database EviGo!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa nó!",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#888",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setProcessingEventId(eventId);
        try {
          const token = getValidToken();
          await axios.delete(
            `http://localhost:5000/api/events/delete/${eventId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          toast.success("Xóa sự kiện thành công! ✨");
          await fetchAllEvents(); // Load lại bảng tức thì
        } catch (err) {
          toast.error(
            err.response?.data?.message || "Không thể xóa bài đăng này!",
          );
        } finally {
          setProcessingEventId(null);
        }
      }
    });
  };

  const totalApproved = allEvents.filter((e) => e.status === "approved").length;
  const totalPending = allEvents.filter((e) => e.status === "pending").length;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h2>Quản lý Toàn bộ Hệ thống EviGo 🛡️</h2>
        <p>Chào mừng Super Admin quay trở lại bản doanh!</p>
      </header>

      {loading ? (
        <div className="loader">Đang tải dữ liệu hệ thống...</div>
      ) : (
        <>
          {/* 📊 KHU VỰC THỐNG KÊ SỐ LIỆU TỔNG QUAN */}
          <div className="admin-stats">
            <div className="stat-card purple">
              <h3>{users.length}</h3>
              <p>Tổng số Thành viên</p>
            </div>
            <div className="stat-card green">
              <h3>{totalApproved}</h3>
              <p>Sự kiện Trên sàn (Approved)</p>
            </div>
            <div className="stat-card red">
              <h3>{totalPending}</h3>
              <p>Sự kiện Chờ duyệt (Pending)</p>
            </div>
          </div>

          {/* 👥 BẢNG 1: QUẢN LÝ DANH SÁCH THÀNH VIÊN + Bộ phễu lọc */}
          <div className="table-responsive spacing-bottom">
            <div className="event-filter-header">
              <h3>👥 Danh sách Thành viên EviGo</h3>

              <div className="filter-tabs-container">
                <button
                  onClick={() => setUserFilter("all")}
                  className={`btn-tab-user ${userFilter === "all" ? "active" : ""}`}
                >
                  Tất cả ({users.length})
                </button>
                <button
                  onClick={() => setUserFilter("superadmin")}
                  className={`btn-tab-user tab-superadmin ${userFilter === "superadmin" ? "active" : ""}`}
                >
                  👑 SuperAdmin (
                  {
                    users.filter(
                      (u) => String(u.role).toLowerCase() === "superadmin",
                    ).length
                  }
                  )
                </button>
                <button
                  onClick={() => setUserFilter("admin")}
                  className={`btn-tab-user tab-admin ${userFilter === "admin" ? "active" : ""}`}
                >
                  🛡️ Admin (
                  {
                    users.filter(
                      (u) => String(u.role).toLowerCase() === "admin",
                    ).length
                  }
                  )
                </button>
                <button
                  onClick={() => setUserFilter("user")}
                  className={`btn-tab-user tab-user ${userFilter === "user" ? "active" : ""}`}
                >
                  👤 User (
                  {
                    users.filter(
                      (u) => !u.role || String(u.role).toLowerCase() === "user",
                    ).length
                  }
                  )
                </button>
              </div>
            </div>

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
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr
                      key={user._id}
                      className={
                        processingId === user._id ? "row-processing" : ""
                      }
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
                      Không tìm thấy Evier nào thuộc chức vụ này.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <hr className="section-divider" />

          {/* 🎪 BẢNG 2: TỔNG HỢP KIỂM SOÁT TẤT CẢ SỰ KIỆN TOÀN WEB */}
          <div className="table-responsive">
            <div className="event-filter-header">
              <h3>🎪 Toàn bộ Sự kiện hệ thống (Kiểm soát mọi trạng thái)</h3>

              <div className="filter-tabs-container">
                <button
                  onClick={() => setEventFilter("all")}
                  className={`btn-tab-event ${eventFilter === "all" ? "active" : ""}`}
                >
                  Tất cả ({allEvents.length})
                </button>
                <button
                  onClick={() => setEventFilter("pending")}
                  className={`btn-tab-event tab-pending ${eventFilter === "pending" ? "active" : ""}`}
                >
                  🟣 Chờ duyệt (
                  {allEvents.filter((e) => e.status === "pending").length})
                </button>
                <button
                  onClick={() => setEventFilter("approved")}
                  className={`btn-tab-event tab-approved ${eventFilter === "approved" ? "active" : ""}`}
                >
                  🟢 Đã duyệt (
                  {allEvents.filter((e) => e.status === "approved").length})
                </button>
                <button
                  onClick={() => setEventFilter("rejected")}
                  className={`btn-tab-event tab-rejected ${eventFilter === "rejected" ? "active" : ""}`}
                >
                  🔴 Đã hủy (
                  {allEvents.filter((e) => e.status === "rejected").length})
                </button>
              </div>
            </div>

            {loadingEvents ? (
              <div className="loader sub-loader">
                Đang kết nối kho dữ liệu sự kiện...
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>SỰ KIỆN</th>
                    <th>NGƯỜI ĐĂNG</th>
                    <th>ĐỊA CHỈ & QUẬN</th>
                    <th>TRẠNG THÁI</th>
                    <th>THAO TÁC SYSTEM</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.length > 0 ? (
                    filteredEvents.map((event) => {
                      const displaySenderName =
                        event.contributor?.displayName ||
                        event.contributor?.name ||
                        event.contributorName ||
                        "User EviGo";

                      return (
                        <tr
                          key={event._id}
                          className={
                            processingEventId === event._id
                              ? "row-processing"
                              : ""
                          }
                        >
                          <td>
                            <span className="event-title-span">
                              {event.title || "Không có tên"}
                            </span>
                            <span className="event-type-badge">
                              {event.type}
                            </span>
                          </td>
                          <td>
                            <span>{displaySenderName}</span>
                          </td>
                          <td>
                            <div className="district-text">
                              {event.locations?.[0]?.district || "---"}
                            </div>
                            <small className="address-subtext">
                              {event.locations?.[0]?.address
                                ? `${event.locations[0].address.substring(0, 20)}...`
                                : "---"}
                            </small>
                          </td>
                          <td>
                            <span className={`status-badge ${event.status}`}>
                              {event.status === "approved"
                                ? "🟢 Đã duyệt"
                                : event.status === "rejected"
                                  ? "🔴 Đã hủy"
                                  : "🟣 Chờ duyệt"}
                            </span>
                          </td>
                          <td>
                            <button
                              disabled={processingEventId === event._id}
                              className="btn-system-delete"
                              onClick={() =>
                                handleDeleteEvent(event._id, event.title)
                              }
                            >
                              {processingEventId === event._id
                                ? "Đang xóa..."
                                : "Xóa vĩnh viễn"}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="empty-table">
                        Không tìm thấy sự kiện nào ứng với bộ lọc này! 🍃
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}

const Event = require("../models/Event");

// 1. Gửi đóng góp sự kiện mới (🎯 CẬP NHẬT: Cơ chế bốc dữ liệu đa tầng từ req.body và req.user)
exports.createEvent = async (req, res) => {
  try {
    const rawLocs = req.body.locations ? JSON.parse(req.body.locations) : [];
    const locations = rawLocs.map((loc) => ({
      address: loc.address || "",
      district: loc.district || "",
      lat: Number(loc.lat) || 0,
      lng: Number(loc.lng) || 0,
    }));

    const imagePaths = req.files
      ? req.files.map((f) => f.path.replace(/\\/g, "/"))
      : [];

    // 🎯 CHIẾN THUẬT QUÉT TÊN TÀI KHOẢN:
    // Ưu tiên 1: Tên do Frontend bốc từ localStorage nộp lên (req.body.contributorName)
    // Ưu tiên 2: Tên giải mã từ Token (req.user)
    // Ưu tiên 3: Nếu hệ thống lỗi hoàn toàn mới để User EviGo
    const activeUsername =
      req.body.contributorName ||
      (req.user ? req.user.username || req.user.name : "User EviGo");
    const activeDisplayName =
      req.body.contributorName ||
      (req.user ? req.user.displayName || req.user.username : "User EviGo");

    const eventData = {
      ...req.body,
      locations,
      images: imagePaths,
      image: imagePaths.length > 0 ? imagePaths[0] : "",
      isPermanent: String(req.body.isPermanent) === "true",
      isAllDay: String(req.body.isAllDay) === "true",
      closedDays: req.body.closedDays ? JSON.parse(req.body.closedDays) : [],

      // 🎯 ĐỒNG BỘ KHỚP KHÍT: Ghi trực tiếp tên tài khoản thật vào object contributor của Database
      contributor: {
        name: activeUsername.trim(),
        displayName: activeDisplayName.trim(),
        contact: req.user
          ? req.user.email || ""
          : req.body.contributorContact || "",
      },
      status: "pending",
    };

    if (req.body.startDate && req.body.startDate !== "")
      eventData.startDate = req.body.startDate;
    if (req.body.endDate && req.body.endDate !== "")
      eventData.endDate = req.body.endDate;

    const newEvent = new Event(eventData);
    await newEvent.save();
    res.status(201).json({ message: "Gửi đóng góp thành công!" });
  } catch (err) {
    console.error("❌ Lỗi createEvent:", err.message);
    res.status(500).json({ error: "Lỗi xử lý dữ liệu đóng góp" });
  }
};

// 2. Lấy danh sách đóng góp cá nhân
exports.getMyContributedEvents = async (req, res) => {
  try {
    const activeUser = req.user ? req.user.username || req.user.name : "";
    const events = await Event.find({ "contributor.name": activeUser })
      .sort({ createdAt: -1 })
      .lean();
    res.status(200).json(events || []);
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi lấy danh sách đóng góp" });
  }
};

// 3. Phê duyệt/Từ chối sự kiện
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const adminId = req.user ? req.user.id : null;

    if (!status) return res.status(400).json({ error: "Thiếu trạng thái!" });

    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { status: status.toLowerCase(), approvedBy: adminId },
      { new: true },
    );
    res
      .status(200)
      .json({ message: "Cập nhật thành công!", data: updatedEvent });
  } catch (err) {
    res.status(500).json({ error: "Lỗi hệ thống khi duyệt" });
  }
};

// 4. Lấy danh sách cho Admin (Lọc Tím/Xanh/Đỏ)
exports.getAdminEventsByStatus = async (req, res) => {
  try {
    const { status } = req.query;
    const adminId = req.user.id;
    let query = { status: status };

    if (status === "approved" || status === "rejected") {
      query.approvedBy = adminId;
    }

    const rawEvents = await Event.find(query).sort({ updatedAt: -1 }).lean();

    // Bảo hiểm dữ liệu cũ: Chỉ đắp chữ nếu bài đăng lịch sử bị khuyết hoàn toàn object contributor
    const events = rawEvents.map((event) => {
      if (
        !event.contributor ||
        (!event.contributor.displayName && !event.contributor.name)
      ) {
        event.contributor = {
          name: event.contributorName || "User EviGo",
          displayName: event.contributorName || "User EviGo",
          contact: "",
        };
      }
      return event;
    });

    res.status(200).json(events || []);
  } catch (err) {
    res.status(500).json({ error: "Lỗi tải danh sách quản trị" });
  }
};

// 5. Lấy TẤT CẢ sự kiện đã duyệt cho cộng đồng
exports.getApprovedEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: "approved" })
      .sort({ updatedAt: -1 })
      .lean();
    res.status(200).json(events || []);
  } catch (err) {
    res.status(500).json({ error: "Lỗi tải danh sách công khai" });
  }
};

// 6. Lấy danh sách chờ duyệt (Việc chung Admin)
exports.getPendingEvents = async (req, res) => {
  try {
    const rawEvents = await Event.find({ status: "pending" })
      .sort({ createdAt: -1 })
      .lean();

    // Trả về nguyên vẹn dữ liệu contributor thật do hàm createEvent lưu xuống
    const events = rawEvents.map((event) => {
      if (
        !event.contributor ||
        (!event.contributor.displayName && !event.contributor.name)
      ) {
        event.contributor = {
          name: event.contributorName || "User EviGo",
          displayName: event.contributorName || "User EviGo",
          contact: "",
        };
      }
      return event;
    });

    res.status(200).json(events || []);
  } catch (err) {
    res.status(500).json({ error: "Lỗi tải danh sách chờ duyệt" });
  }
};

// 7. Thống kê năng suất Admin
exports.getAdminStats = async (req, res) => {
  try {
    const adminId = req.user.id;
    const [approvedCount, rejectedCount, pendingCount] = await Promise.all([
      Event.countDocuments({ status: "approved", approvedBy: adminId }),
      Event.countDocuments({ status: "rejected", approvedBy: adminId }),
      Event.countDocuments({ status: "pending" }),
    ]);
    res.status(200).json({ approvedCount, rejectedCount, pendingCount });
  } catch (err) {
    res.status(500).json({ error: "Lỗi lấy thống kê" });
  }
};

// 8. Xóa sự kiện
exports.deleteEvent = async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Xóa thành công!" });
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi xóa" });
  }
};

// 9. Lấy chi tiết sự kiện
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).lean();
    if (!event) return res.status(404).json({ message: "Không tìm thấy!" });
    res.status(200).json(event);
  } catch (err) {
    res.status(500).json({ error: "Lỗi chi tiết" });
  }
};

// 10. Lấy tất cả (Cho SuperAdmin)
exports.getAllEventsForAdmin = async (req, res) => {
  try {
    const events = await Event.find({}).sort({ createdAt: -1 }).lean();
    res.status(200).json(events || []);
  } catch (err) {
    res.status(500).json({ error: "Lỗi server" });
  }
};

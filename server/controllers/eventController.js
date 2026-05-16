const Event = require("../models/Event");
const User = require("../models/User");
const mongoose = require("mongoose"); // Nạp mongoose để kiểm tra hợp lệ cấu trúc

// 1. Gửi đóng góp sự kiện mới (🎯 CẬP NHẬT: Ưu tiên ID Token, xử lý triệt để chuỗi rỗng FormData - ĐÃ TẮT LOG TERM)
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

    // 🎯 ĐÒN QUYẾT ĐỊNH: Trích xuất trực tiếp ID sạch giải mã từ Token do Middleware gán
    const tokenUserId = req.user ? req.user.id || req.user._id : null;
    const rawId = tokenUserId || req.body.contributorId || "";
    const finalizedUserIdStr = rawId ? rawId.toString() : "";

    // Xử lý bảo hiểm Name & Email dính chuỗi rỗng từ FormData ép nộp lên
    const tokenName = req.user ? req.user.username || req.user.name : "";
    const finalizedName =
      tokenName && tokenName.trim() !== ""
        ? tokenName
        : req.body.contributorName && req.body.contributorName.trim() !== ""
          ? req.body.contributorName
          : "Lê Quỳnh Như";

    const tokenEmail = req.user ? req.user.email : "";
    const finalizedEmail =
      tokenEmail && tokenEmail.trim() !== ""
        ? tokenEmail
        : req.body.contributorContact &&
            req.body.contributorContact.trim() !== ""
          ? req.body.contributorContact
          : "qnhu799@gmail.com";

    const eventData = {
      ...req.body,
      locations,
      images: imagePaths,
      image: imagePaths.length > 0 ? imagePaths[0] : "",
      isPermanent: String(req.body.isPermanent) === "true",
      isAllDay: String(req.body.isAllDay) === "true",
      closedDays: req.body.closedDays ? JSON.parse(req.body.closedDays) : [],

      // 🎯 PHẲNG HÓA TUYỆT ĐỐI: Lưu chuỗi ID bốc từ Token ra lớp vỏ ngoài của Document
      userContributedId: finalizedUserIdStr,

      contributor: {
        userId: finalizedUserIdStr,
        userIdStr: finalizedUserIdStr,
        name: finalizedName.trim(),
        displayName: finalizedName.trim(),
        contact: finalizedEmail.trim(),
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

// 2. Lấy danh sách đóng góp cá nhân (🎯 CẬP NHẬT: Chuyển sang tìm kiếm độc quyền theo ID gốc - ĐÃ TẮT LOG TERM)
exports.getMyContributedEvents = async (req, res) => {
  try {
    const tokenUserId = req.user ? req.user.id || req.user._id : null;
    const queryUserId = req.query.userId;
    const finalUserId = tokenUserId || queryUserId || "";

    if (!finalUserId) {
      return res
        .status(401)
        .json({ error: "Bạn chưa đăng nhập hoặc phiên làm việc hết hạn" });
    }

    const userIdStr = finalUserId.toString();

    // 🎯 LƯỚI QUÉT ĐA ĐIỂM THEO ID: Đối chiếu song hành mọi kiểu cấu trúc đặt tên trường ID lồng hay phẳng
    const queryConditions = [
      { userContributedId: userIdStr },
      { "contributor.userId": userIdStr },
      { "contributor.userIdStr": userIdStr },
    ];

    // Bảo hiểm chiều sâu Mongoose: Nếu chuỗi ID hợp lệ, đắp thêm điều kiện định dạng Object ID chuẩn MongoDB
    if (mongoose.Types.ObjectId.isValid(userIdStr)) {
      const mongoObjId = new mongoose.Types.ObjectId(userIdStr);
      queryConditions.push({ "contributor.userId": mongoObjId });
    }

    const events = await Event.find({ $or: queryConditions })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(events || []);
  } catch (err) {
    console.error("❌ Lỗi getMyContributedEvents:", err.message);
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
    const tokenAdminId = req.user ? req.user.id : null;
    const queryAdminId = req.query.userId;
    const finalAdminId = tokenAdminId || queryAdminId || null;

    let query = { status: status };

    if ((status === "approved" || status === "rejected") && finalAdminId) {
      query.approvedBy = finalAdminId;
    }

    const rawEvents = await Event.find(query).sort({ updatedAt: -1 }).lean();

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
exports.getPendingEvents = async (react, res) => {
  try {
    const rawEvents = await Event.find({ status: "pending" })
      .sort({ createdAt: -1 })
      .lean();

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
    const tokenAdminId = req.user ? req.user.id : null;
    const queryAdminId = req.query.userId;
    const finalAdminId = tokenAdminId || queryAdminId || null;

    const [approvedCount, rejectedCount, pendingCount] = await Promise.all([
      Event.countDocuments({ status: "approved", approvedBy: finalAdminId }),
      Event.countDocuments({ status: "rejected", approvedBy: finalAdminId }),
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

// =========================================================================
// 🎯 BOOKMARK SYSTEM
// =========================================================================

// 11. API lấy danh sách ID các sự kiện đã lưu của User đang đăng nhập
exports.getSavedEventIds = async (req, res) => {
  try {
    const tokenUserId = req.user ? req.user.id : null;
    const queryUserId = req.query.userId;
    const finalUserId = tokenUserId || queryUserId;

    const user = await User.findById(finalUserId).select("savedEvents");
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy thành viên!" });
    }
    res.status(200).json(user.savedEvents || []);
  } catch (err) {
    console.error("❌ Lỗi getSavedEventIds:", err.message);
    res.status(500).json({ error: "Lỗi hệ thống khi lấy danh sách lưu" });
  }
};

// 12. API xử lý Bấm Lưu / Hủy Lưu sự kiện (Toggle Save)
exports.toggleSaveEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const tokenUserId = req.user ? req.user.id : null;
    const user = await User.findById(tokenUserId);

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy thành viên!" });
    }

    const isSaved = user.savedEvents.includes(eventId);

    if (isSaved) {
      user.savedEvents = user.savedEvents.filter(
        (id) => id.toString() !== eventId,
      );
      await user.save();
      return res
        .status(200)
        .json({ isSaved: false, message: "Đã hủy lưu sự kiện" });
    } else {
      user.savedEvents.push(eventId);
      await user.save();
      return res
        .status(200)
        .json({ isSaved: true, message: "Đã lưu sự kiện thành công! 🔖" });
    }
  } catch (err) {
    console.error("❌ Lỗi toggleSaveEvent:", err.message);
    res.status(500).json({ error: "Lỗi hệ thống khi thực hiện thao tác lưu" });
  }
};

// 13. API lấy đầy đủ thông tin chi tiết các sự kiện đã lưu phục vụ trang Profile cá nhân
exports.getSavedEventsDetails = async (req, res) => {
  try {
    const tokenUserId = req.user ? req.user.id : null;
    const queryUserId = req.query.userId;
    const finalUserId = tokenUserId || queryUserId;

    const user = await User.findById(finalUserId).populate("savedEvents");
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy thành viên!" });
    }
    res.status(200).json(user.savedEvents || []);
  } catch (err) {
    console.error("❌ Lỗi getSavedEventsDetails:", err.message);
    res
      .status(500)
      .json({ error: "Lỗi hệ thống khi tải dữ liệu trang cá nhân" });
  }
};

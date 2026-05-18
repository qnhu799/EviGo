const Event = require("../models/Event");
const User = require("../models/User");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

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

    const tokenUserId = req.user ? req.user.id || req.user._id : null;
    const rawId = tokenUserId || req.body.contributorId || "";
    const finalizedUserIdStr = rawId ? rawId.toString() : "";

    let contributorName =
      req.user?.username || req.user?.name || req.user?.displayName;

    if (
      !contributorName ||
      contributorName.trim() === "" ||
      contributorName === "User EviGo" ||
      contributorName === "Người dùng EviGo"
    ) {
      const userEmail = req.user?.email || "";
      if (userEmail && userEmail.includes("@")) {
        contributorName = userEmail.split("@")[0];
      } else {
        contributorName =
          req.body.contributorName && req.body.contributorName.trim() !== ""
            ? req.body.contributorName
            : "Lê Quỳnh Như";
      }
    }

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

      userContributedId: finalizedUserIdStr,
      userContributedMongoId: mongoose.Types.ObjectId.isValid(
        finalizedUserIdStr,
      )
        ? new mongoose.Types.ObjectId(finalizedUserIdStr)
        : null,

      contributor: {
        userId: finalizedUserIdStr,
        userIdStr: finalizedUserIdStr,
        name: contributorName.trim(),
        displayName: contributorName.trim(),
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

    const queryConditions = [
      { userContributedId: userIdStr },
      { "contributor.userId": userIdStr },
      { "contributor.userIdStr": userIdStr },
    ];

    if (mongoose.Types.ObjectId.isValid(userIdStr)) {
      const mongoObjId = new mongoose.Types.ObjectId(userIdStr);
      queryConditions.push({ "contributor.userId": mongoObjId });
      queryConditions.push({ userContributedMongoId: mongoObjId });
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

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const adminId = req.user ? req.user._id || req.user.id : null;

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

exports.getPendingEvents = async (req, res) => {
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

exports.deleteEvent = async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Xóa thành công!" });
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi xóa" });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("approvedBy", "name displayName email")
      .lean();

    if (!event) return res.status(404).json({ message: "Không tìm thấy!" });
    res.status(200).json(event);
  } catch (err) {
    res.status(500).json({ error: "Lỗi chi tiết" });
  }
};

exports.getAllEventsForAdmin = async (req, res) => {
  try {
    const events = await Event.find({}).sort({ createdAt: -1 }).lean();
    res.status(200).json(events || []);
  } catch (err) {
    res.status(500).json({ error: "Lỗi server" });
  }
};

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
        .json({ isSaved: false, message: "Đã xóa khỏi danh sách lưu!" });
    } else {
      user.savedEvents.push(eventId);
      await user.save();
      return res.status(200).json({
        isSaved: true,
        message: "Đã thêm vào danh sách yêu thích! ❤️",
      });
    }
  } catch (err) {
    console.error("❌ Lỗi toggleSaveEvent:", err.message);
    res.status(500).json({ error: "Lỗi hệ thống khi thực hiện thao tác lưu" });
  }
};

exports.getSavedEventsDetails = async (req, res) => {
  try {
    const tokenUserId = req.user ? req.user.id : null;
    const queryUserId = req.query.userId;
    const finalUserId = tokenUserId || queryUserId;

    const user = await User.findById(finalUserId).populate("savedEvents");
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy thành viên!" });
    }

    const cleanSavedEvents = (user.savedEvents || []).filter(
      (event) => event !== null,
    );

    res.status(200).json(cleanSavedEvents);
  } catch (err) {
    console.error("❌ Lỗi getSavedEventsDetails:", err.message);
    res
      .status(500)
      .json({ error: "Lỗi hệ thống khi tải dữ liệu trang cá nhân" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, oldPassword, newPassword } = req.body;
    const userId = req.user ? req.user.id || req.user._id : null;

    if (!userId) {
      return res
        .status(401)
        .json({
          message: "Phiên làm việc hết hạn, vui lòng đăng nhập lại! 🔒",
        });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy tài khoản người dùng!" });
    }

    if (name) user.username = name.trim();
    if (phone) user.phone = phone.trim();

    if (newPassword) {
      if (!oldPassword) {
        return res
          .status(400)
          .json({ message: "Vui lòng nhập mật khẩu hiện tại để xác thực!" });
      }
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({
            message: "Mật khẩu hiện tại không chính xác rồi! ❌",
          });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    await user.save();

    if (name) {
      await Event.updateMany(
        { userContributedId: userId.toString() },
        {
          $set: {
            "contributor.name": name.trim(),
            "contributor.displayName": name.trim(),
          },
        },
      );
    }

    res.status(200).json({ message: "Cập nhật hồ sơ thành công! ✨" });
  } catch (err) {
    console.error("❌ Lỗi updateProfile:", err.message);
    res
      .status(500)
      .json({ error: "Lỗi hệ thống khi cập nhật thông tin hồ sơ" });
  }
};

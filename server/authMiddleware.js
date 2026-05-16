const jwt = require("jsonwebtoken");

// 1. Kiểm tra xem có đăng nhập chưa (🎯 NÂNG CẤP TỐI CAO: Quét sạch ID, Tên, Email đa tầng Payload - ĐÃ TẮT LOG TERM)
const protect = (req, res, next) => {
  let token = req.headers.authorization;
  if (token && token.startsWith("Bearer")) {
    try {
      const jwtSecret = process.env.JWT_SECRET || "EviGo_Secret_Key_997";
      const decoded = jwt.verify(token.split(" ")[1], jwtSecret);

      let finalizedId = null;
      let finalizedUsername = "";
      let finalizedEmail = "";

      if (decoded) {
        // Tầng 1: Quét tìm ID sâu tầng (Giữ nguyên thuật toán chuẩn của Như)
        finalizedId =
          decoded.id ||
          decoded._id ||
          decoded.userId ||
          decoded.idUser ||
          decoded.uid;

        if (!finalizedId && decoded.user) {
          finalizedId =
            decoded.user.id || decoded.user._id || decoded.user.userId;
        }
        if (!finalizedId && decoded.data) {
          finalizedId =
            decoded.data.id || decoded.data._id || decoded.data.userId;
        }

        // 🎯 TẦNG 2 BẢO HIỂM MỚI: Bới tung mọi tầng để tìm Tên hiển thị (Username)
        finalizedUsername =
          decoded.username ||
          decoded.name ||
          decoded.displayName ||
          (decoded.user
            ? decoded.user.username ||
              decoded.user.name ||
              decoded.user.displayName
            : "") ||
          (decoded.data ? decoded.data.username || decoded.data.name : "") ||
          "User EviGo";

        // 🎯 TẦNG 3 BẢO HIỂM MỚI: Bới tung mọi tầng để tìm Email liên hệ
        finalizedEmail =
          decoded.email ||
          decoded.mail ||
          (decoded.user ? decoded.user.email || decoded.user.mail : "") ||
          (decoded.data ? decoded.data.email : "") ||
          "";
      }

      req.user = {
        ...decoded,
        id: finalizedId ? finalizedId.toString() : null,
        _id: finalizedId ? finalizedId.toString() : null,
        role:
          decoded.role || (decoded.user ? decoded.user.role : "user") || "user",
        username: finalizedUsername.trim(),
        email: finalizedEmail.trim(), // Khóa chặt email sạch tìm được phục vụ lưới quét đối chiếu
      };

      // 🎯 ĐH ĐÃ ẨN DÒNG CONSOLE.LOG THỪA TẠI ĐÂY GIÚP TRÌNH ĐIỀU KHIỂN SẠCH SẼ CHUYÊN NGHIỆP

      next();
    } catch (error) {
      console.error("❌ Lỗi giải mã Token bảo mật:", error.message);
      res.status(401).json({ message: "Phiên làm việc hết hạn!" });
    }
  } else {
    res.status(401).json({ message: "Vui lòng đăng nhập để tiếp tục!" });
  }
};

// 2. Chỉ cho phép Admin (Giữ nguyên gốc của Như)
const adminOnly = (req, res, next) => {
  if (
    req.user &&
    (req.user.role === "admin" || req.user.role === "superadmin")
  ) {
    next();
  } else {
    res
      .status(403)
      .json({ message: "Chỉ Admin mới có quyền thực hiện hành động này!" });
  }
};

// 3. Cho phép Admin VÀ Thành viên đóng góp (Giữ nguyên logic của Như)
const canContribute = (req, res, next) => {
  if (
    req.user &&
    (req.user.role === "user" ||
      req.user.role === "admin" ||
      req.user.role === "superadmin" ||
      req.user.role === "organizer")
  ) {
    next();
  } else {
    res
      .status(403)
      .json({ message: "Bạn cần nâng cấp tài khoản để đóng góp sự kiện!" });
  }
};

module.exports = { protect, adminOnly, canContribute };

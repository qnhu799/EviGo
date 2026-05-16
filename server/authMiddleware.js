const jwt = require("jsonwebtoken");

// 1. Kiểm tra xem có đăng nhập chưa
const protect = (req, res, next) => {
  let token = req.headers.authorization;
  if (token && token.startsWith("Bearer")) {
    try {
      // 🎯 ĐỒNG BỘ KHÓA BÍ MẬT: Khớp khít với khóa dùng trong file authRoutes.js
      const jwtSecret = process.env.JWT_SECRET || "EviGo_Secret_Key_997";

      const decoded = jwt.verify(token.split(" ")[1], jwtSecret);
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ message: "Phiên làm việc hết hạn!" });
    }
  } else {
    res.status(401).json({ message: "Vui lòng đăng nhập để tiếp tục!" });
  }
};

// 2. Chỉ cho phép Admin (🎯 CẬP NHẬT: Cho phép cả superadmin đi vào)
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

// 3. Cho phép Admin VÀ Thành viên đóng góp (🎯 CẬP NHẬT: Mở rộng cho mọi role, kể cả user thường và superadmin đều đóng góp được)
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

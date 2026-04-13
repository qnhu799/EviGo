const jwt = require("jsonwebtoken");

// 1. Kiểm tra xem có đăng nhập chưa
const protect = (req, res, next) => {
  let token = req.headers.authorization;
  if (token && token.startsWith("Bearer")) {
    try {
      const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ message: "Phiên làm việc hết hạn!" });
    }
  } else {
    res.status(401).json({ message: "Vui lòng đăng nhập để tiếp tục!" });
  }
};

// 2. Chỉ cho phép Admin
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res
      .status(403)
      .json({ message: "Chỉ Admin mới có quyền thực hiện hành động này!" });
  }
};

// 3. Cho phép Admin VÀ Thành viên đóng góp
const canContribute = (req, res, next) => {
  if (
    req.user &&
    (req.user.role === "admin" || req.user.role === "organizer")
  ) {
    next();
  } else {
    res
      .status(403)
      .json({ message: "Bạn cần nâng cấp tài khoản để đóng góp sự kiện!" });
  }
};

module.exports = { protect, adminOnly, canContribute };

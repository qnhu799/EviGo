import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const userRole = localStorage.getItem("role");
  const token = localStorage.getItem("token") || localStorage.getItem("Token");

  // 🎯 TỐI ƯU: Nếu trong LocalStorage đã có token thật nhưng role chưa kịp load xong (bất đồng bộ),
  // tạm thời cho qua hoặc đợi một nhịp để tránh bị đá văng về trang chủ quá sớm.
  if (token && !userRole) {
    return children;
  }

  // Nếu hoàn toàn không có cả token lẫn role, hoặc role không hợp lệ, đá văng về trang chủ!
  if (!token || !allowedRoles || !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;

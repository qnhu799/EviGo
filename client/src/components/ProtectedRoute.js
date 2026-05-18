import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const userRole = localStorage.getItem("role");
  const token = localStorage.getItem("token") || localStorage.getItem("Token");

  if (token && !userRole) {
    return children;
  }

  if (!token || !allowedRoles || !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;

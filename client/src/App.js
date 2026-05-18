import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import MapPage from "./pages/MapPage";
import ContributePage from "./pages/ContributePage";
import Admin from "./pages/Admin";
import Login from "./pages/LoginPage";
import Register from "./pages/Register";
import Profile from "./pages/ProfilePage";
import ForgotPassword from "./pages/ForgotPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/AdminDashboard";
import { Toaster } from "react-hot-toast";
import ScrollToTop from "./components/ScrollToTop";
import EventDetail from "./pages/EventDetail";

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Toaster position="top-center" reverseOrder={false} />

      <div className="app-container">
        <Header />
        <main style={{ minHeight: "80vh" }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/event/:id" element={<EventDetail />} />

            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={["user", "admin", "superadmin"]}>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/contribute"
              element={
                <ProtectedRoute allowedRoles={["user", "admin", "superadmin"]}>
                  <ContributePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                  <Admin />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admindashboard"
              element={
                <ProtectedRoute allowedRoles={["superadmin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

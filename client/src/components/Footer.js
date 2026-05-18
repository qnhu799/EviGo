import React from "react";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="evigo-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>EviGo</h3>
          <p>
            Hệ thống WebGIS hỗ trợ quản lý và đề xuất các sự kiện hấp dẫn
          </p>
        </div>

        <div className="footer-section">
          <h3>Khám phá</h3>
          <ul>
            <li>
              <a href="/">Trang chủ</a>
            </li>
            <li>
              <a href="/map">Bản đồ Sự kiện</a>
            </li>
            <li>
              <a href="/contribute">Đóng góp ngay</a>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Liên hệ</h3>
          <p>Khoa Môi trường và Tài nguyên</p>
          <p>Trường Đại học Nông Lâm TP.HCM</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 EviGo - Khóa luận tốt nghiệp của Lê Quỳnh Như</p>
      </div>
    </footer>
  );
}
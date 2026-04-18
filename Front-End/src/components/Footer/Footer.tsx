import React from "react";
import "./Footer.css";
import { FaFacebookF, FaYoutube, FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer">

      {/* Newsletter */}
      <div className="footer-top">

        <div className="newsletter">
          <p>Đăng ký nhận tin</p>

          <div className="newsletter-input">
            <input type="email" placeholder="Nhập email của bạn" />
            <button>ĐĂNG KÝ</button>
          </div>
        </div>

        <div className="social">
          <p>Kết nối với chúng tôi</p>

          <div className="social-icons">
            <a href="#"><FaFacebookF /></a>
            <a href="#"><FaYoutube /></a>
          </div>
        </div>

      </div>

      {/* Footer content */}
      <div className="footer-content">

        {/* Company */}
        <div className="footer-column">
          <h3>CÔNG TY NỘI THẤT BAYA</h3>

          <p>
            Thương hiệu nội thất và trang trí hàng đầu Việt Nam,
            góp phần xây dựng thêm nhiều tổ ấm mỗi ngày.
          </p>

          <p className="info">
            <FaMapMarkerAlt />
            Tầng 08, Tòa nhà Pearl Plaza, 561A Điện Biên Phủ,
            Quận Bình Thạnh, TP Hồ Chí Minh
          </p>

          <p className="info">
            <FaPhone /> 1900 63 64 76
          </p>

          <p className="info">
            <FaEnvelope /> webshop@baya.vn
          </p>
        </div>

        {/* About */}
        <div className="footer-column">
          <h3>VỀ BAYA</h3>

          <ul>
            <li>Giới thiệu</li>
            <li>Liên hệ</li>
            <li>Blog</li>
            <li>Hệ thống cửa hàng</li>
          </ul>
        </div>

        {/* Support */}
        <div className="footer-column">
          <h3>HỖ TRỢ KHÁCH HÀNG</h3>

          <ul>
            <li>Câu hỏi thường gặp</li>
            <li>Hướng dẫn đặt hàng</li>
            <li>Mua hàng trả góp</li>
            <li>Hướng dẫn thanh toán VNPAY</li>
          </ul>
        </div>

        {/* Other */}
        <div className="footer-column">
          <h3>CÁC THÔNG TIN KHÁC</h3>

          <ul>
            <li>Tin mới nhất</li>
          </ul>
        </div>

      </div>

      {/* Bottom */}
      <div className="footer-bottom">
        © 2026 Nội thất BAYA. All rights reserved.
      </div>

    </footer>
  );
};

export default Footer;
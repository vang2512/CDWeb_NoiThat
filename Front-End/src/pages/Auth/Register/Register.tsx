import React, { useState, useEffect } from "react";
import "./Register.css";
import logo from "../../../assets/images/logo-baya.png";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { User, Phone, Mail, Lock, Eye, EyeOff } from "lucide-react";

import authApi from "../../../api/Auth/Auth_Api";
import OtpModal from "../../../components/otp/OtpModal";
import { useTranslation } from "react-i18next";

const Register: React.FC = () => {

  const { t } = useTranslation();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [fullName, setFullName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const [showOtp, setShowOtp] = useState<boolean>(false);
  const [isVerified, setIsVerified] = useState<boolean>(false);

  const navigate = useNavigate();

  useEffect(() => {
    document.title = t("register_title");
  }, [t]);

  // 📩 GỬI OTP
  const handleSendOtp = async () => {
    if (!email) {
      alert(t("enter_email"));
      return;
    }

    try {
      const res = await authApi.sendOtp(email);

      if (res.data.success) {
        setShowOtp(true);
      } else {
        alert(res.data.message);
      }

    } catch (err) {
      console.error(err);
    }
  };

  // 🔐 VERIFY
  const handleVerified = async () => {

    setShowOtp(false);

    try {
      await authApi.register({
        email,
        password,
        fullName,
        phone
      });

      toast.success(t("register_success"));

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (err) {
      console.error(err);
      toast.error(t("register_fail"));
    }
  };

  // 🧾 REGISTER
  const handleRegister = async () => {

    if (!fullName || !phone || !email || !password || !confirmPassword) {
      toast.error(t("error_required"));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error(t("error_email"));
      return;
    }

    if (password.length < 6) {
      toast.error(t("error_password_length"));
      return;
    }

    if (password !== confirmPassword) {
      toast.error(t("error_password_match"));
      return;
    }

    try {
      const res = await authApi.sendOtp(email);

      if (res.data.success) {
        toast.success(t("otp_sent"));
        setShowOtp(true);
      } else {
        toast.error(res.data.message);
      }

    } catch (err) {
      console.error(err);
      toast.error(t("send_otp_error"));
    }
  };

  return (
    <div className="register-container">

      <div className="register-box">

        <div className="register-logo">
          <img src={logo} alt="logo"/>
        </div>

        <h2>{t("register_title")}</h2>

        {/* Họ tên */}
        <div className="form-group">
          <label>{t("full_name")}</label>
          <div className="input-box">
            <User size={18}/>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              type="text"
              placeholder={t("enter_full_name")}
            />
          </div>
        </div>

        {/* Phone */}
        <div className="form-group">
          <label>{t("phone")}</label>
          <div className="input-box">
            <Phone size={18}/>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="text"
              placeholder={t("enter_phone")}
            />
          </div>
        </div>

        {/* Email */}
        <div className="form-group">
          <label>{t("email")}</label>
          <div className="input-box">
            <Mail size={18}/>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder={t("enter_email")}
            />
          </div>
        </div>

        {/* Password */}
        <div className="form-group">
          <label>{t("password")}</label>
          <div className="input-box">
            <Lock size={18}/>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              placeholder={t("enter_password")}
            />
            <span onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
            </span>
          </div>
        </div>

        {/* Confirm */}
        <div className="form-group">
          <label>{t("confirm_password")}</label>
          <div className="input-box">
            <Lock size={18}/>
            <input
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              type={showConfirm ? "text" : "password"}
              placeholder={t("enter_confirm_password")}
            />
            <span onClick={() => setShowConfirm(!showConfirm)}>
              {showConfirm ? <EyeOff size={18}/> : <Eye size={18}/>}
            </span>
          </div>
        </div>

        <button className="register-btn" onClick={handleRegister}>
          {t("register_button")}
        </button>

        <div className="register">
          {t("have_account")}
          <span onClick={() => navigate("/login")}>
            {t("login_now")}
          </span>
        </div>

      </div>

      {/* OTP MODAL */}
      {showOtp && (
        <OtpModal
          email={email}
          onClose={() => setShowOtp(false)}
          onVerified={handleVerified}
        />
      )}

    </div>
  );
};

export default Register;
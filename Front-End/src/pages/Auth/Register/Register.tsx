import React, { useState, useEffect } from "react";
import "./Register.css";
import logo from "../../../assets/images/logo-baya.png";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { User, Phone, Mail, Lock, Eye, EyeOff } from "lucide-react";
import {
  validateFullName,
  validatePhone,
  validatePassword,
  validateConfirmPassword,
  validateEmail // Thêm import
} from "../../../utils/validate";
import authApi from "../../../api/Auth/Auth_Api";
import OtpModal from "../../../components/otp/OtpModal";
import { useTranslation } from "react-i18next";

const Register: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // State cho các trường input
  const [fullName, setFullName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  // State cho show/hide password
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);

  // State cho OTP
  const [showOtp, setShowOtp] = useState<boolean>(false);

  // State cho lỗi realtime
  const [errors, setErrors] = useState({
    fullName: "",
    phone: "",
    email: "", // Thêm email vào errors
    password: "",
    confirmPassword: ""
  });

  // State kiểm tra email đang được check
  const [checkingEmail, setCheckingEmail] = useState<boolean>(false);
  
  // State để kiểm tra đã validate toàn bộ chưa
  const [isFormValid, setIsFormValid] = useState<boolean>(false);

  // Debounce timer cho email
  const [emailTimeout, setEmailTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    document.title = t("register_title");
  }, [t]);

  // Kiểm tra form hợp lệ mỗi khi errors hoặc các trường thay đổi
  useEffect(() => {
    const isValid = 
      fullName.trim() !== "" &&
      phone.trim() !== "" &&
      email.trim() !== "" &&
      password.trim() !== "" &&
      confirmPassword.trim() !== "" &&
      errors.fullName === "" &&
      errors.phone === "" &&
      errors.email === "" && // Kiểm tra email error
      errors.password === "" &&
      errors.confirmPassword === "" &&
      !checkingEmail; // Đang check email thì không cho submit
    
    setIsFormValid(isValid);
  }, [fullName, phone, email, password, confirmPassword, errors, checkingEmail]);

  // Hàm kiểm tra email tồn tại từ server
  const checkEmailExists = async (emailValue: string) => {
    if (!emailValue || errors.email !== "") return;
    
    setCheckingEmail(true);
    try {
      const response = await authApi.checkEmail(emailValue);
      if (response.data.exists) {
        setErrors(prev => ({
          ...prev,
          email: t("Email đã được đăng ký") 
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          email: ""
        }));
      }
    } catch (error) {
      console.error("Check email error:", error);
    } finally {
      setCheckingEmail(false);
    }
  };

  // Xử lý thay đổi email với debounce
  const handleEmailChange = (value: string) => {
    setEmail(value);
    
    // Clear timeout cũ
    if (emailTimeout) {
      clearTimeout(emailTimeout);
    }
    
    // Validate email cơ bản trước
    const basicEmailError = validateEmail(value);
    
    if (basicEmailError) {
      setErrors(prev => ({
        ...prev,
        email: basicEmailError
      }));
      setCheckingEmail(false);
      return;
    }
    
    // Nếu email hợp lệ cơ bản, set tạm thời không lỗi
    setErrors(prev => ({
      ...prev,
      email: ""
    }));
    
    // Debounce kiểm tra server sau 500ms
    const timeout = setTimeout(() => {
      checkEmailExists(value);
    }, 500);
    
    setEmailTimeout(timeout);
  };

  // Xử lý thay đổi fullName
  const handleFullNameChange = (value: string) => {
    setFullName(value);
    setErrors(prev => ({
      ...prev,
      fullName: validateFullName(value)
    }));
  };

  // Xử lý thay đổi phone
  const handlePhoneChange = (value: string) => {
    setPhone(value);
    setErrors(prev => ({
      ...prev,
      phone: validatePhone(value)
    }));
  };

  // Xử lý thay đổi password
  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setErrors(prev => ({
      ...prev,
      password: validatePassword(value),
      confirmPassword: validateConfirmPassword(value, confirmPassword)
    }));
  };

  // Xử lý thay đổi confirmPassword
  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    setErrors(prev => ({
      ...prev,
      confirmPassword: validateConfirmPassword(password, value)
    }));
  };

  // Gửi OTP
  const handleSendOtp = async () => {
    if (!email) {
      toast.error(t("enter_email"));
      return;
    }

    const emailError = validateEmail(email);
    if (emailError) {
      toast.error(emailError);
      return;
    }

    try {
      const res = await authApi.sendOtp(email);
      if (res.data.success) {
        setShowOtp(true);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error(t("send_otp_error"));
    }
  };

  // Xác thực OTP thành công
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

  // Đăng ký
  const handleRegister = async () => {
    // Kiểm tra các trường không được để trống
    if (!fullName.trim()) {
      toast.error(t("error_fullname_required"));
      return;
    }
    if (!phone.trim()) {
      toast.error(t("error_phone_required"));
      return;
    }
    if (!email.trim()) {
      toast.error(t("error_email_required"));
      return;
    }
    if (!password.trim()) {
      toast.error(t("error_password_required"));
      return;
    }
    if (!confirmPassword.trim()) {
      toast.error(t("error_confirm_password_required"));
      return;
    }

    // Kiểm tra email hợp lệ
    const emailError = validateEmail(email);
    if (emailError) {
      toast.error(emailError);
      return;
    }

    // Kiểm tra email đã tồn tại chưa
    if (errors.email) {
      toast.error(errors.email);
      return;
    }

    // Kiểm tra password length
    if (password.length < 6) {
      toast.error(t("error_password_length"));
      return;
    }

    // Kiểm tra password match
    if (password !== confirmPassword) {
      toast.error(t("error_password_match"));
      return;
    }

    // Kiểm tra các lỗi validation khác
    if (errors.fullName || errors.phone || errors.password || errors.confirmPassword) {
      toast.error(t("error_fix_validation"));
      return;
    }

    // Gửi OTP
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
          <img src={logo} alt="logo" />
        </div>

        <h2>{t("register_title")}</h2>

        {/* Họ tên */}
        <div className={`form-group ${errors.fullName ? 'has-error' : ''}`}>
          <label>{t("full_name")}</label>
          <div className="input-box">
            <User size={18} />
            <input
              value={fullName}
              onChange={(e) => handleFullNameChange(e.target.value)}
              type="text"
              placeholder={t("enter_full_name") as string}
            />
          </div>
          {errors.fullName && <p className="error">{errors.fullName}</p>}
        </div>

        {/* Số điện thoại */}
        <div className={`form-group ${errors.phone ? 'has-error' : ''}`}>
          <label>{t("phone")}</label>
          <div className="input-box">
            <Phone size={18} />
            <input
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              type="text"
              placeholder={t("enter_phone") as string}
            />
          </div>
          {errors.phone && <p className="error">{errors.phone}</p>}
        </div>

        {/* Email */}
        <div className={`form-group ${errors.email ? 'has-error' : ''}`}>
          <label>{t("email")}</label>
          <div className="input-box">
            <Mail size={18} />
            <input
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              type="email"
              placeholder={t("enter_email") as string}
            />
            {checkingEmail && (
              <span className="checking-email">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </span>
            )}
          </div>
          {errors.email && <p className="error">{errors.email}</p>}
          {checkingEmail && <p className="checking-text">{t("checking_email")}</p>}
        </div>

        {/* Mật khẩu */}
        <div className={`form-group ${errors.password ? 'has-error' : ''}`}>
          <label>{t("password")}</label>
          <div className="input-box">
            <Lock size={18} />
            <input
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              type={showPassword ? "text" : "password"}
              placeholder={t("enter_password") as string}
            />
            <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>
          {errors.password && <p className="error">{errors.password}</p>}
        </div>

        {/* Xác nhận mật khẩu */}
        <div className={`form-group ${errors.confirmPassword ? 'has-error' : ''}`}>
          <label>{t("confirm_password")}</label>
          <div className="input-box">
            <Lock size={18} />
            <input
              value={confirmPassword}
              onChange={(e) => handleConfirmPasswordChange(e.target.value)}
              type={showConfirm ? "text" : "password"}
              placeholder={t("enter_confirm_password") as string}
            />
            <span className="eye-icon" onClick={() => setShowConfirm(!showConfirm)}>
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>
          {errors.confirmPassword && (
            <p className="error">{errors.confirmPassword}</p>
          )}
        </div>

        <button 
          className="register-btn" 
          onClick={handleRegister}
          disabled={!isFormValid}
        >
          {t("register_button")}
        </button>

        <div className="register">
          {t("have_account")}
          <span onClick={() => navigate("/login")}>{t("login_now")}</span>
        </div>
      </div>

      {/* OTP Modal */}
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
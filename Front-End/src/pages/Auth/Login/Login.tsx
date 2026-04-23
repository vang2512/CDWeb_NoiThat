import React, { useState, useEffect } from "react";
import "./Login.css";
import logo from "../../../assets/images/logo-baya.png";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import authApi from "../../../api/Auth/Auth_Api";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import ReCAPTCHA from "react-google-recaptcha";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider, facebookProvider } from "../../../firebase";
import { validateLoginEmail, validateLoginPassword } from "../../../utils/validate";

const Login: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // State cho các trường input
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [captchaValue, setCaptchaValue] = useState<string | null>(null);

  // State cho lỗi realtime
  const [errors, setErrors] = useState({
    email: "",
    password: ""
  });

  // State kiểm tra email tồn tại
  const [checkingEmail, setCheckingEmail] = useState<boolean>(false);
  const [emailExists, setEmailExists] = useState<boolean>(false);
  const [emailTimeout, setEmailTimeout] = useState<NodeJS.Timeout | null>(null);

  // State kiểm tra form hợp lệ
  const [isFormValid, setIsFormValid] = useState<boolean>(false);

  useEffect(() => {
    document.title = t("login_title");
  }, [t]);

  // Kiểm tra form hợp lệ
  useEffect(() => {
    const isValid = 
      email.trim() !== "" &&
      password.trim() !== "" &&
      errors.email === "" &&
      errors.password === "" &&
      emailExists === true &&
      captchaValue !== null;
    
    setIsFormValid(isValid);
  }, [email, password, errors, emailExists, captchaValue]);

  // Kiểm tra email tồn tại từ server
  const checkEmailExists = async (emailValue: string) => {
    if (!emailValue) {
      setEmailExists(false);
      setCheckingEmail(false);
      return;
    }

    setCheckingEmail(true);
    try {
      const response = await authApi.checkEmail(emailValue);
      if (response.data.exists) {
        setEmailExists(true);
        setErrors(prev => ({ ...prev, email: "" }));
      } else {
        setEmailExists(false);
        setErrors(prev => ({ ...prev, email: t("email_not_registered") }));
      }
    } catch (error) {
      console.error("Check email error:", error);
      setEmailExists(false);
      setErrors(prev => ({ ...prev, email: t("server_error") }));
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
    
    // Validate format email bằng hàm từ validate.js
    const formatError = validateLoginEmail(value);
    
    if (formatError) {
      setErrors(prev => ({ ...prev, email: formatError }));
      setEmailExists(false);
      setCheckingEmail(false);
      return;
    }
    
    // Nếu email hợp lệ về format, set tạm thời
    setErrors(prev => ({ ...prev, email: "" }));
    
    // Debounce kiểm tra server sau 500ms
    const timeout = setTimeout(() => {
      checkEmailExists(value);
    }, 500);
    
    setEmailTimeout(timeout);
  };

  // Xử lý thay đổi password
  const handlePasswordChange = (value: string) => {
    setPassword(value);
    const passwordError = validateLoginPassword(value);
    setErrors(prev => ({ ...prev, password: passwordError }));
  };

  // HANDLE LOGIN
  const handleLogin = async () => {
    // Kiểm tra captcha
    if (!captchaValue) {
      toast.error(t("error_captcha"));
      return;
    }

    // Kiểm tra email tồn tại
    if (!emailExists) {
      toast.error(t("email_not_registered"));
      return;
    }

    // Kiểm tra validation
    if (errors.email || errors.password) {
      toast.error(t("error_fix_validation"));
      return;
    }

    try {
      const res = await authApi.login({
        email,
        password
      });

      if (res.data.success) {
        toast.success(t("login_success"));
        localStorage.setItem("user", JSON.stringify(res.data.user));

        setTimeout(() => {
          navigate("/");
          window.location.reload();
        }, 1200);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error(t("server_error"));
    }
  };

  // Xử lý login Google
  const handleLoginGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      console.log("Google user:", user);
      const res = await authApi.socialLogin({
        email: user.email,
        fullName: user.displayName
      });

      if (res.data.success) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
        toast.success(t("login_google_success"));

        setTimeout(() => {
          navigate("/");
          window.location.reload();
        }, 1200);
      } else {
        toast.error(res.data.message);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(t("login_google_fail"));
    }
  };

  // Xử lý login Facebook
  const handleLoginFacebook = async () => {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      const user = result.user;

      console.log("Facebook user:", user);

      const res = await authApi.socialLogin({
        email: user.email,
        fullName: user.displayName
      });

      if (res.data.success) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
        toast.success(t("login_facebook_success"));
        setTimeout(() => {
          navigate("/");
          window.location.reload();
        }, 1200);
      } else {
        toast.error(res.data.message);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(t("login_facebook_fail"));
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        {/* Logo */}
        <div className="login-logo">
          <img src={logo} alt="logo" />
        </div>

        <h2>{t("login_title")}</h2>

        {/* Email */}
        <div className={`form-group ${errors.email ? 'has-error' : ''}`}>
          <label>{t("email")}</label>
          <div className="input-box">
            <Mail size={18} />
            <input
              type="email"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
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

        {/* Password */}
        <div className={`form-group ${errors.password ? 'has-error' : ''}`}>
          <label>{t("password")}</label>
          <div className="input-box">
            <Lock size={18} />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              placeholder={t("enter_password") as string}
            />
            <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>
          {errors.password && <p className="error">{errors.password}</p>}
        </div>

        {/* Forgot */}
        <div className="forgot">
          <span onClick={() => navigate("/forgot-password")}>
            {t("forgot_password")}
          </span>
        </div>

        {/* LOGIN BUTTON */}
        <button 
          className="login-btn" 
          onClick={handleLogin}
          disabled={!isFormValid}
          style={{ opacity: !isFormValid ? 0.6 : 1, cursor: !isFormValid ? "not-allowed" : "pointer" }}
        >
          {t("login_button")}
        </button>

        <div className="captcha-box">
          <ReCAPTCHA
            sitekey="6Lcg_gorAAAAALw4HqIHqcriQY0NuEMNla5jU6pv"
            onChange={(value) => setCaptchaValue(value)}
          />
        </div>

        {/* Register */}
        <div className="register">
          {t("no_account")}
          <span onClick={() => navigate("/register")}>
            {t("register_now")}
          </span>
        </div>

        <div className="divider"></div>

        {/* Social login */}
        <div className="social-login">
          <button className="google-btn" onClick={handleLoginGoogle}>
            <img src="https://cdn-icons-png.flaticon.com/512/281/281764.png" alt="google" />
            {t("login_google")}
          </button>

          <button className="facebook-btn" onClick={handleLoginFacebook}>
            <img src="https://cdn-icons-png.flaticon.com/512/124/124010.png" alt="facebook" />
            {t("login_facebook")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
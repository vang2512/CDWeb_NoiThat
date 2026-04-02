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

const Login: React.FC = () => {

  const { t } = useTranslation();

  const [showPassword, setShowPassword] = useState(false);
  const [captchaValue, setCaptchaValue] = useState<string | null>(null);

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const navigate = useNavigate();

  useEffect(() => {
    document.title = t("login_title");
  }, [t]);

  // HANDLE LOGIN
  const handleLogin = async () => {

    if (!email || !password) {
      toast.error(t("error_required"));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error(t("error_email"));
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

  // function xử lý login Google
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

      toast.success("Đăng nhập Google thành công!");

      setTimeout(() => {
        navigate("/");
        window.location.reload();
      }, 1200);
    } else {
      toast.error(res.data.message);
    }

  } catch (err: any) {
    console.error(err);
    toast.error("Login Google thất bại!");
  }
};

// Function đăng nhập bằng facebook
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
      toast.success("Đăng nhập Facebook thành công!");
      setTimeout(() => {
        navigate("/");
        window.location.reload();
      }, 1200);
    } else {
      toast.error(res.data.message);
    }

  } catch (err: any) {
    console.error(err);
    toast.error("Login Facebook thất bại!");
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
        <div className="form-group">
          <label>{t("email")}</label>

          <div className="input-box">
            <Mail size={18} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("enter_email")}
            />
          </div>
        </div>

        {/* Password */}
        <div className="form-group">
          <label>{t("password")}</label>

          <div className="input-box">
            <Lock size={18} />

            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("enter_password")}
            />

            <span
              className="eye-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>
        </div>

        {/* Forgot */}
        <div className="forgot">
          <span onClick={() => navigate("/forgot-password")}>
            {t("forgot_password")}
          </span>
        </div>

        {/* LOGIN BUTTON */}
        <button className="login-btn" onClick={handleLogin}>
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
            <img src="https://cdn-icons-png.flaticon.com/512/281/281764.png" />
            {t("login_google")}
          </button>

          <button className="facebook-btn" onClick={handleLoginFacebook}>
            <img src="https://cdn-icons-png.flaticon.com/512/124/124010.png" />
            {t("login_facebook")}
          </button>

        </div>

      </div>

    </div>
  );
};

export default Login;
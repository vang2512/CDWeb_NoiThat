import React, { useState, useEffect } from "react";
import "../Login/Login.css";
import logo from "../../../assets/images/logo-baya.png";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import authApi from "../../../api/Auth/Auth_Api";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

const ResetPassword = () => {

  const { t } = useTranslation();

  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    document.title = t("reset_title");
  }, [t]);

  const handleSubmit = async () => {
    if (!password || !confirmPassword) {
      toast.error(t("error_required"));
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
      const res = await authApi.resetPassword({
        email,
        newPassword: password
      });

      toast.success(res.data.message);

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (err) {
      console.error(err);
      toast.error(t("reset_fail"));
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">

        <div className="login-logo">
          <img src={logo} alt="logo" />
        </div>

        <h2>{t("reset_title")}</h2>

        <div className="form-group">

          {/* PASSWORD */}
          <label>{t("new_password")}</label>
          <div className="input-box">
            <Lock size={18} />

            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <span onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff /> : <Eye />}
            </span>
          </div>

          {/* CONFIRM */}
          <label>{t("confirm_password")}</label>
          <div className="input-box">
            <Lock size={18} />

            <input
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <span onClick={() => setShowConfirm(!showConfirm)}>
              {showConfirm ? <EyeOff /> : <Eye />}
            </span>
          </div>

        </div>

        <button className="login-btn" onClick={handleSubmit}>
          {t("confirm")}
        </button>

      </div>
    </div>
  );
};

export default ResetPassword;
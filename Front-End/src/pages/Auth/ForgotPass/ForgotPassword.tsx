import React, { useEffect, useState } from "react";
import "../Login/Login.css";
import logo from "../../../assets/images/logo-baya.png";
import OtpModal from "../../../components/otp/OtpModal";
import authApi from "../../../api/Auth/Auth_Api";
import toast from "react-hot-toast";

import { useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import { useTranslation } from "react-i18next";

const ForgotPassword = () => {

  const { t } = useTranslation();

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = t("forgot_title");
  }, [t]);

  const handleSubmit = async () => {
    if (!email) {
      toast.error(t("error_email_required"));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error(t("error_email_invalid"));
      return;
    }

    try {
      setLoading(true);

      // CHECK EMAIL
      const checkRes = await authApi.checkEmail(email);

      if (!checkRes.data.exists) {
        toast.error(t("error_email_not_exist"));
        return;
      }

      // GỬI OTP
      const res = await authApi.sendOtpRes(email);

      if (res.data.success) {
        toast.success(t("otp_sent"));
        setShowOtp(true);
      } else {
        toast.error(res.data.message);
      }

    } catch (err) {
      console.error(err);
      toast.error(t("server_error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">

        <div className="login-logo">
          <img src={logo} alt="logo" />
        </div>

        <h2>{t("forgot_title")}</h2>

        <div className="form-group">
          <label>Email</label>

          <div className="input-box">
            <Mail size={18} />

            <input
              type="email"
              placeholder={t("enter_email") as string}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <button className="login-btn" onClick={handleSubmit}>
          {loading ? t("sending") : t("send_otp")}
        </button>

        <div className="register">
          {t("back")}
          <span onClick={() => navigate("/login")}>
            {" "}{t("back_login")}
          </span>
        </div>
      </div>

      {/* OTP */}
      {showOtp && (
        <OtpModal
          email={email}
          onClose={() => setShowOtp(false)}
          onVerified={() => {
            setShowOtp(false);
            navigate("/reset-password", {
              state: { email }
            });
          }}
        />
      )}
    </div>
  );
};

export default ForgotPassword;
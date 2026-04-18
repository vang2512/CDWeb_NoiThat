import React, { useState, useEffect } from "react";
import authApi from "../../api/Auth/Auth_Api";
import "./OtpModal.css";
import { useTranslation } from "react-i18next";

interface OtpModalProps {
  email: string;
  onClose: () => void;
  onVerified: () => void;
}

const OtpModal: React.FC<OtpModalProps> = ({
  email,
  onClose,
  onVerified
}) => {

  const { t } = useTranslation();

  const [otp, setOtp] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isExpired, setIsExpired] = useState<boolean>(false);

  // COUNTDOWN
  useEffect(() => {
    if (timeLeft <= 0) {
      setIsExpired(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // 🔐 VERIFY OTP
  const handleVerify = async () => {

    if (isExpired) {
      alert(t("otp_expired"));
      return;
    }

    if (!otp) {
      alert(t("otp_required"));
      return;
    }

    try {
      const res = await authApi.verifyOtp(email, otp);

      if (res.data.valid) {
        onVerified();
      } else {
        alert(t("otp_invalid"));
      }
    } catch (err) {
      console.error(err);
      alert(t("otp_verify_error"));
    }
  };

  // format time
  const formatTime = (time: number) => {
    const seconds = time < 10 ? `0${time}` : time;
    return `00:${seconds}`;
  };

  return (
    <div className="otp-overlay">
      <div className="otp-box">

        <h3>{t("otp_title")}</h3>

        {/* ⏱ TIME */}
        <p className={`otp-timer ${isExpired ? "expired" : ""}`}>
          {isExpired
            ? t("otp_expired")
            : `${t("otp_remaining")}: ${formatTime(timeLeft)}`
          }
        </p>

        <input
          type="text"
          value={otp}
          maxLength={4}
          onChange={(e) => setOtp(e.target.value)}
          placeholder={t("otp_placeholder")}
        />

        <div className="otp-actions">
          <button
            onClick={handleVerify}
            disabled={isExpired}
          >
            {t("otp_confirm")}
          </button>

          <button onClick={onClose}>
            {t("otp_close")}
          </button>
        </div>

      </div>
    </div>
  );
};

export default OtpModal;
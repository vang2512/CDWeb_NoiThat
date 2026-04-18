import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./StoreAddress.css";
import { useTranslation } from "react-i18next";

const StoreAddress = () => {

  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = t("store.title");
  }, [t]);

  return (
    <div className="store-container">

      {/* Breadcrumb */}
      <div className="breadcrumb">
        <span onClick={() => navigate("/")}>{t("store.home")}</span>
        <span className="slash">/</span>
        <span>{t("store.system")}</span>
      </div>

      <div className="store-grid">

        {/* MAP */}
        <div className="store-map">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d108576.81174657971!2d106.6037042771911!3d10.7236097633709!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317528a7e0d52e65%3A0x68d98161109b3397!2zQ8O0bmcgVHkgQ-G7lSBQaOG6p24gTuG7mWkgVGjhuqV0IEJheWE!5e0!3m2!1svi!2s!4v1732612353356!5m2!1svi!2s"
            loading="lazy"
          ></iframe>
        </div>

        {/* STORE INFO */}
        <div className="store-info">

          <img
            src="https://cafefcdn.com/zoom/700_438/2020/2020-photo-1-15820969889581758994248-31-0-893-1379-crop-1582097078195-637177298987352500.jpg"
            alt="store"
            className="store-img"
          />

          <h3>{t("store.name")}</h3>

          <p>
            <b>{t("store.address")}:</b>{" "}
            673 Điện Biên Phủ, Khu phố 2, Bình Thạnh, TP Hồ Chí Minh
          </p>

          <p>
            <b>{t("store.openTime")}:</b>{" "}
            8:00 - 21:00 (cả CN và ngày lễ)
          </p>

          <p>
            <b>{t("store.phone")}:</b>{" "}
            <a href="tel:0869380448">0869 380 448</a>
          </p>

        </div>

      </div>

      {/* STORE FEATURES */}
      <div className="store-features">

        <p>{t("store.features.f1")}</p>
        <p>{t("store.features.f2")}</p>
        <p>{t("store.features.f3")}</p>
        <p>{t("store.features.f4")}</p>
        <p>{t("store.features.f5")}</p>
        <p>{t("store.features.f6")}</p>

      </div>

    </div>
  );
};

export default StoreAddress;
import React, { useState, useEffect } from "react";
import authApi from "../../api/Auth/Auth_Api";
import "./Header.css";
import logo from "../../assets/images/logo.png";
import { useNavigate } from "react-router-dom";

import { Search, ShoppingCart, User, MapPinCheck, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

const Header: React.FC = () => {

  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  // USER
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // LANGUAGE
  const [lang, setLang] = useState(localStorage.getItem("lang") || "vi");

  const handleChangeLang = (value: string) => {
    setLang(value);
    localStorage.setItem("lang", value);
    i18n.changeLanguage(value);
  };

  // Api tìm tên 
  useEffect(() => {
    const delay = setTimeout(() => {
      if (keyword.trim() !== "") {
        handleSearch(keyword);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [keyword]);

  const handleSearch = async (text: string) => {
    try {
      setLoading(true);
      const res = await authApi.searchProduct(text);
      setResults(res.data);
      setShowDropdown(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <header className="header">
      <div className="header-container">

        {/* LOGO */}
        <div className="logo" onClick={() => navigate("/")}>
          <img src={logo} alt="logo" />
        </div>

        {/* SEARCH */}
        <div className="search-box">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder={t("search_placeholder")}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          />

          {/* DROPDOWN */}
          {showDropdown && (
            <div className="search-dropdown">

              {loading && <div className="search-loading">Đang tìm...</div>}

              {!loading && results.length === 0 && keyword && (
                <div className="search-empty">Không tìm thấy</div>
              )}

              {results.map((item) => (
                <div
                  key={item.id}
                  className="search-item"
                  onClick={() => {
                    navigate(`/product-detail/${item.id}`);
                    setKeyword("");
                    setResults([]);
                    setShowDropdown(false);
                  }}  >
                  {item.name}
                </div>
              ))}

            </div>
          )}
        </div>

        {/* RIGHT MENU */}
        <div className="header-right">

          {/* CART */}
          <div className="menu-item" onClick={() => navigate("/cart")}>
            <ShoppingCart size={18} />
            <span>{t("cart")}</span>
          </div>

          {/* USER */}
          <div className="menu-item">
            <User size={18} />
            {user ? (
              <span onClick={() => navigate("/profile")}>
                {user.fullName}
              </span>
            ) : (
              <span onClick={() => navigate("/login")}>
                {t("login")}
              </span>
            )}
          </div>

          {/* LANGUAGE */}
          <div className="menu-item language">
            <Globe size={18} />
            <select
              value={lang}
              onChange={(e) => handleChangeLang(e.target.value)}
            >
              <option value="vi">VI</option>
              <option value="en">EN</option>
            </select>
          </div>

          {/* LOCATION */}
          <div className="location" onClick={() => navigate("/store")}>
            <MapPinCheck size={18} />
            <span>{t("location")}</span>
          </div>

        </div>

      </div>
    </header>
  );
};

export default Header;
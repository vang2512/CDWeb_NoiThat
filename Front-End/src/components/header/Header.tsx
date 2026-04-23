import React, { useState, useEffect, useRef } from "react";
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
  const [isSearchActive, setIsSearchActive] = useState(false); // Thêm state này

  // USER
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // LANGUAGE
  const [lang, setLang] = useState(localStorage.getItem("lang") || "vi");

  // Refs
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleChangeLang = (value: string) => {
    setLang(value);
    localStorage.setItem("lang", value);
    i18n.changeLanguage(value);
  };

  // Toggle search trên mobile
  const toggleSearch = () => {
    setIsSearchActive(!isSearchActive);
    if (!isSearchActive) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      setKeyword("");
      setResults([]);
      setShowDropdown(false);
    }
  };

  // Click outside để đóng search trên mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target as Node)) {
        setIsSearchActive(false);
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Api tìm tên 
  useEffect(() => {
    const delay = setTimeout(() => {
      if (keyword.trim() !== "") {
        handleSearch(keyword);
      } else {
        setResults([]);
        setShowDropdown(false);
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
        <div className={`search-boxx ${isSearchActive ? "active" : ""}`} ref={searchBoxRef}>
          <Search className="search-icon" onClick={toggleSearch} size={18} />
          <input
            ref={searchInputRef}
            type="text"
            placeholder={t("search_placeholder") as string}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onFocus={() => setShowDropdown(true)}
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
                    setIsSearchActive(false);
                  }}
                >
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
            <span>{t("language")}</span>
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
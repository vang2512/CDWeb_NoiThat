import React from "react";
import "./Home.css";
import { useNavigate } from "react-router-dom";

import { NewsItem } from "../types/news";


interface HomeProps {
    allNews: NewsItem[];
}

function Home({ allNews }: HomeProps) {
    const navigate = useNavigate();


    const toInternalLink = (link: string) => {
        return link.replace("https://dantri.com.vn", "");
    };

    if (!allNews || allNews.length === 0) return null;

    // 1. Kiểm tra dữ liệu đầu vào: Nếu chưa có tin thì hiện Loading
    if (!allNews || allNews.length === 0) {
        return (
            <div style={{ textAlign: "center", padding: "50px", color: "#666" }}>
                <h3>Đang tải tin tức...</h3>
                <div className="spinner"></div> {/* Nếu bạn có class spinner trong CSS */}
            </div>
        );
    }

    // 2. Hàm chuyển trang sang chi tiết bài viết
    const goDetail = (article: NewsItem) => {

        if (!article.link.includes(".htm")) return;

        const path = toInternalLink(article.link);

        navigate(path, {
            state: article
        });
    };

    return (
        <div className="home-container">
            {/* --- SECTION 1: TOP HIGHLIGHTS (Tin nổi bật nhất) --- */}
            <section className="top-story-grid">
                {/* Tin chính lớn nhất bên trái */}
                <div className="main-featured">
                    <div className="big-card" onClick={() => goDetail(allNews[0])} style={{cursor: 'pointer'}}>
                        <div className="img-hover">
                            <img src={allNews[0]?.image} alt={allNews[0]?.title}/>
                        </div>
                        <h2>{allNews[0]?.title}</h2>
                        <p>{allNews[0]?.description}</p>
                    </div>
                </div>

                {/* Các tin phụ nằm giữa */}
                <div className="sub-featured">
                    {allNews.slice(1, 6).map((item, i) => (
                        <div key={i} className="mini-card" onClick={() => goDetail(item)} style={{cursor: 'pointer'}}>
                            <img src={item?.image} alt={item?.title}/>
                            <h4>{item?.title}</h4>
                        </div>
                    ))}
                </div>

                {/* Sidebar tin mới nhất bên phải */}
                <div className="sidebar-latest">
                    <h3 className="sidebar-title">TIN NÓNG 24H</h3>
                    {allNews.slice(6, 13).map((item, i) => (
                        <div key={i} className="list-item-only-text" onClick={() => goDetail(item)} style={{cursor: 'pointer'}}>
                            <span className="rank-num">{i + 1}</span>
                            <p>{item?.title}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* --- SECTION 2: VIDEO & MULTIMEDIA --- */}
            <section className="multimedia-section">
                <h3 className="section-label">VIDEO - MULTIMEDIA</h3>
                <div className="multimedia-grid">
                    {/* Video chính lớn */}
                    <div className="video-main" onClick={() => goDetail(allNews[14])} style={{cursor: 'pointer'}}>
                        <img src={allNews[14]?.image} alt="Video Main"/>
                        <div className="play-icon">▶</div>
                        <div className="video-overlay">
                            <h3>{allNews[14]?.title}</h3>
                        </div>
                    </div>

                    {/* Các video nhỏ bên cạnh */}
                    <div className="video-sub">
                        {allNews.slice(15, 18).map((item, i) => (
                            <div key={i} className="video-item-small" onClick={() => goDetail(item)} style={{cursor: 'pointer'}}>
                                <div className="video-thumb">
                                    <img src={item?.image} alt=""/>
                                    <div className="play-icon-small">▶</div>
                                </div>
                                <p>{item?.title}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- SECTION 3: CHUYÊN MỤC (3 CỘT) --- */}
            <div className="category-layout">
                {[
                    {title: "THỜI SỰ", start: 18, end: 24, color: "#e74c3c"},
                    {title: "THẾ GIỚI", start: 24, end: 30, color: "#2980b9"},
                    {title: "KINH TẾ", start: 30, end: 36, color: "#27ae60"}
                ].map((cat, idx) => (
                    <div className="cat-column" key={idx}>
                        <h3 className="cat-title" style={{borderBottomColor: cat.color, color: cat.color}}>
                            {cat.title}
                        </h3>
                        {/* Tin đầu mục có ảnh */}
                        <div className="cat-main-item" onClick={() => goDetail(allNews[cat.start])} style={{cursor: 'pointer'}}>
                            <img src={allNews[cat.start]?.image} alt=""/>
                            <h4>{allNews[cat.start]?.title}</h4>
                        </div>
                        {/* List tin text phía dưới */}
                        {allNews.slice(cat.start + 1, cat.end).map((item, i) => (
                            <div key={i} className="small-flex-item" onClick={() => goDetail(item)} style={{cursor: 'pointer'}}>
                                <p>{item?.title}</p>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* --- SECTION 4: MAGAZINE --- */}
            <section className="magazine-section">
                <div className="magazine-banner">
                    <div className="magazine-content">
                        <span>MAGAZINE</span>
                        <h2>{allNews[37]?.title}</h2>
                        <p>{allNews[37]?.description}</p>
                        <button className="read-more" onClick={() => goDetail(allNews[37])}>
                            Đọc tiếp
                        </button>
                    </div>
                    <div className="magazine-img-wrapper" onClick={() => goDetail(allNews[37])} style={{cursor: 'pointer'}}>
                        <img src={allNews[37]?.image} alt="Magazine Cover"/>
                    </div>
                </div>
            </section>

            {/* --- PREMIUM POPUP AD (QUẢNG CÁO NỔI) --- */}
            <div className="premium-pop-ad">
                <button className="close-ad-btn" onClick={(e) => {
                    const ad = e.currentTarget.parentElement;
                    if (ad) {
                        // Hiệu ứng mờ dần trước khi tắt hẳn
                        ad.style.opacity = '0';
                        ad.style.transform = 'translateY(20px) scale(0.9)';
                        setTimeout(() => { ad.style.display = 'none' }, 300);
                    }
                }}>×</button>

                {/* Link quảng cáo trỏ ra ngoài (External Link) nên dùng thẻ a */}
                <a href="https://www.nike.com/vn/" target="_blank" rel="noreferrer" className="ad-link-wrapper">
                    <div className="ad-badge">HOT DEAL</div>
                    <div className="ad-container-flex">
                        <div className="ad-image-box">
                            <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300" alt="Special Offer"/>
                        </div>
                        <div className="ad-text-box">
                            <h4>Siêu Ưu Đãi Nike</h4>
                            <p>Giảm tới 50% bộ sưu tập mới nhất. Duy nhất tuần này.</p>
                            <div className="ad-action">
                                <span className="price-tag">Từ 990k</span>
                                <button className="shop-now-btn">MUA NGAY</button>
                            </div>
                        </div>
                    </div>
                </a>
            </div>
        </div>
    );
}

export default Home;
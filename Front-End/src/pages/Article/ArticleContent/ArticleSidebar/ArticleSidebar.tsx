import "./ArticleSidebar.css";
import React from "react";
import { useNavigate } from "react-router-dom";
import { NewsItem } from "../../../../types/news";

interface Props {
    categoryName: string;
    hotNews: NewsItem[];
}

function ArticleSidebar({ categoryName, hotNews }: Props) {
    const navigate = useNavigate();

    const handleArticleClick = (e: React.MouseEvent, item: NewsItem) => {
        e.preventDefault();
        window.scrollTo(0, 0);
        navigate("/article", { state: item });
    };

    return (
        <div className="sidebar">
            {/* Quảng cáo 1 */}
            <div id="desktop-right-1">
                <div className="container">
                    <div className="data-advertisement">
                        <a href="https://dienmaythienphu.vn/tivi/tivi-samsung/smart-tivi-samsung-43-inch-4k-ua43du7000kxxv">DT
                            - Thiên Phú_Tivi samsung 5990 - 300x600 - 051126</a>
                        <iframe src="https://cdn.dtadnetwork.com/creatives/html5/202601/1767584924/index.html"></iframe>
                    </div>
                </div>
            </div>

            {/* Bài viết liên quan */}
            <article className="article-hot">
                <div className="article-head">Đọc nhiều trong {categoryName}</div>
                {hotNews.length > 0 ? (
                    hotNews.map((item, index) => (
                        <article className="article-item" key={item.link || index}>
                            <div className="article-content">
                                <a href={item.link} onClick={(e) => handleArticleClick(e, item)}>
                                    <img
                                        className={index === 0 ? "first-image" : ""}
                                        alt={item.title}
                                        src={item.image || "https://via.placeholder.com/480x320?text=No+Image"}
                                    />
                                </a>
                            </div>
                            <h3 className="article-title">
                                <a href={item.link} onClick={(e) => handleArticleClick(e, item)}>
                                    {item.title}
                                </a>
                            </h3>
                        </article>
                    ))
                ) : (
                    <p className="loading-text">Đang tải tin liên quan...</p>
                )}
            </article>

            {/* Quảng cáo 2 */}
            <div id="desktop-right-2">
                <div className="container">
                    <div className="data-advertisement">
                        <a href="https://dienmaythienphu.vn/dieu-hoa-du-an-cong-trinh/dieu-hoa-cay/dieu-hoa-lg-tu-dung">DT
                            - Thiên Phú_Điều hòa công trình_300x600 - 050126</a>
                        <iframe src="https://cdn.dtadnetwork.com/creatives/html5/202601/1767582518/index.html"></iframe>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ArticleSidebar;
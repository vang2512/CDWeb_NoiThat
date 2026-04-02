import "./ArticleSingular.css"
import { NewsItem } from "../../../../types/news";
import React, { useEffect } from "react";
import ArticleAudio from "../ArticleAudio/ArticleAudio";
import CommentSection from "../../../../components/CommentSection/CommentSection";

interface Props {
    article: NewsItem;
    loading: boolean;
    fullContent: string;
    authorName: string;
    authorAvatar: string;
}

// Format thời gian và ngày đăng
const formatDantriDate = (dateString: string) => {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;

        const days = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];
        const dayName = days[date.getDay()];

        const d = String(date.getDate()).padStart(2, '0');
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const y = date.getFullYear();
        const h = String(date.getHours()).padStart(2, '0');
        const min = String(date.getMinutes()).padStart(2, '0');

        return `${dayName}, ${d}/${m}/${y} - ${h}:${min}`;
    } catch (e) {
        return dateString;
    }
};

function ArticleSingular({ article, loading, fullContent, authorName, authorAvatar }: Props) {
    // Dừng đọc khi người dùng chuyển trang
    useEffect(() => {
        return () => window.speechSynthesis.cancel();
    }, []);

    return (
        <div className="singular-wrap">
            {/* Nội dung bài báo */}
            <article className="singular-container">
                <h1 className="title-page detail">{article.title}</h1>
                <div className="author-wrap">
                    <div className="author-avatar">
                        <img src={authorAvatar} alt={authorName} style={{ width: '30px', borderRadius: '50%' }} />
                    </div>
                    <div className="author-meta">
                        <div className="author-name">{authorName}</div>
                        {article.pubDate && (
                            <time className="author-date">
                                {formatDantriDate(article.pubDate)}
                            </time>
                        )}
                    </div>
                </div>

                {/* CHỨC NĂNG QUAN TRỌNG: NÚT TỰ ĐỌC BÁO */}
                {!loading && (
                    <div data-module="article-audio-new">
                        <ArticleAudio
                            title={article.title}
                            description={article.description}
                            content={fullContent}
                        />
                    </div>
                )}

                <h2 className="singular-description">(Dân trí) - {article.description}</h2>

                {loading ? (
                    <div className="skeleton-loading">
                        <p>Đang bóc tách nội dung chi tiết từ Dân trí...</p>
                        <div className="loader"></div>
                    </div>
                ) : (
                    // Sử dụng dangerouslySetInnerHTML để hiển thị các thẻ <br/>
                    <div
                        className="singular-content"
                        dangerouslySetInnerHTML={{ __html: fullContent }}
                    />
                )}
            </article>

            {/* Nút tương tác dành cho người đọc */}
            <div className="dt-flex dt-justify-between">
                <div className="lazyload-wrapper">
                    <div className="dt-flex dt-text">
                        <div className="dt-text-MineShaft">Bài viết hay? Ấn để tương tác</div>
                        <div className="dt-flex dt-items">
                            {/* Nút like */}
                            <button className="dt-flex dt-items dt-transition-all" type="button" aria-label="Bổ ích">
                                <span className="dt-block dt-transition-all">
                                    <img className="dt-object dt-absolute" alt="Bổ ích" src="https://cdnweb.dantri.com.vn/dist/0b717b5b4ca31fd052d3.png"></img>
                                </span>
                                14
                            </button>

                            {/* Nút tim */}
                            <button className="dt-flex dt-items dt-transition-all" type="button" aria-label="Bổ ích">
                                <span className="dt-block dt-transition-all">
                                    <img className="dt-object dt-absolute" alt="Xúc động" src="https://cdnweb.dantri.com.vn/dist/a9f90e37d746f606142a.png"></img>
                                </span>
                                15
                            </button>

                            {/* Nút vỗ tay */}
                            <button className="dt-flex dt-items dt-transition-all" type="button" aria-label="Bổ ích">
                                <span className="dt-block dt-transition-all">
                                    <img className="dt-object dt-absolute" alt="Cảm hứng" src="https://cdnweb.dantri.com.vn/dist/a0fe9393f2777b40eb71.png"></img>
                                </span>
                                6
                            </button>

                            {/* Nút sao */}
                            <button className="dt-flex dt-items dt-transition-all" type="button" aria-label="Bổ ích">
                                <span className="dt-block dt-transition-all">
                                    <img className="dt-object dt-absolute" alt="Độc đáo" src="https://cdnweb.dantri.com.vn/dist/bd6eec4cef16b3c0da60.png"></img>
                                </span>
                                1
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* CHÈN BÌNH LUẬN VÀO ĐÂY */}
            {/* Truyền article.link làm ID để phân biệt comment của bài nào */}
            <div className="article-comments-zone">
                <CommentSection articleId={article.link} />
            </div>
        </div>
    );
}

export default ArticleSingular;
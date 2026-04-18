import "./ArticlePage.css";
import ArticleMain from "./ArticleContent/ArticleMain/ArticleMain";
import { useLocation, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { fetchFullArticle, fetchFullAuthor, fetchNewsByCategory } from "../../services/rssService";

const getDisplayName = (slug: string) => {
    const mapping: Record<string, string> = {
        "phap-luat": "Pháp luật",
        "the-thao": "Thể thao",
        "giai-tri": "Giải trí",
        "suc-khoe": "Sức khỏe",
        "kinh-doanh": "Kinh doanh",
        "the-gioi": "Thế giới",
        "xa-hoi": "Xã hội",
        "giao-duc": "Giáo dục",
        "tam-long-nhan-ai": "Nhân ái",
        "bat-dong-san": "Bất động sản"
    };

    return mapping[slug.toLowerCase()] ||
        (slug.charAt(0).toUpperCase() + slug.slice(1)).replace(/-/g, " ");
};

const getSlugFromLink = (link: string) => {
    try {
        const path = new URL(link).pathname;
        const slug = path.split('/').filter(Boolean)[0]; // Lấy phần đầu sau domain
        return slug?.replace(".htm", "") || "home";
    } catch {
        return "home";
    }
};

function ArticlePage() {
    const location = useLocation();
    const navigate = useNavigate();
    const article = location.state;

    const [loading, setLoading] = useState<boolean>(true);
    const [hotNews, setHotNews] = useState<any[]>([]);

    const [fullData, setFullData] = useState<{content: string, authorName: string, authorAvatar: string}>({
        content: "",
        authorName: "Dân trí",
        authorAvatar: ""
    });

    const categorySlug = article?.category || getSlugFromLink(article?.link);
    const categoryDisplayName = getDisplayName(categorySlug);

    useEffect(() => {
        window.scrollTo(0, 0);

        if (article?.link) {
            setLoading(true);

            Promise.all([
                fetchFullArticle(article.link),
                fetchFullAuthor(article.link),
                fetchNewsByCategory(categorySlug)
            ])
                .then(([content, authorData, relatedNews]) => {
                    setFullData({
                        content: content,
                        authorName: authorData.authorName,
                        authorAvatar: authorData.authorAvatar
                    });

                    const filtered = relatedNews
                        .filter((item: any) => item.link !== article.link)
                        .slice(0, 5);
                    setHotNews(filtered);
                })
                .catch(err => console.error("Lỗi fetch:", err))
                .finally(() => setLoading(false));
        }
    }, [article?.link, categorySlug]);

    if (!article) {
        return (
            <div style={{ padding: 40, textAlign: "center" }}>
                <p>Không tìm thấy bài viết.</p>
                <button onClick={() => navigate("/")}>Quay về trang chủ</button>
            </div>
        );
    }

    return (
        <main className="body">
            <ArticleMain article={article} loading={loading} fullContent={fullData.content} authorName={fullData.authorName} authorAvatar={fullData.authorAvatar} categoryName={categoryDisplayName} hotNews={hotNews} />
        </main>
    );
}

export default ArticlePage;
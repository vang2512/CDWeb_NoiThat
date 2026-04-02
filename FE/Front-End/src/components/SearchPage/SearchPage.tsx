import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchRSS } from "../../services/rssService";
import LatestNews from "../../components/LatestNews/LatestNews";
import "./SearchPage.css";

const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get("q") || "";
    const [allNews, setAllNews] = useState<any[]>([]);
    const [filteredNews, setFilteredNews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Hàm chuẩn hóa tiếng Việt
    const normalizeText = (text: string) => {
        if (!text) return "";
        return text
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/Đ/g, "D")
            .toLowerCase()
            .trim();
    };

    useEffect(() => {
        setLoading(true);
        // Để tìm được nhiều kết quả hơn, bạn có thể fetch đồng thời nhiều RSS
        // hoặc dùng RSS tổng quát nhất
        fetchRSS("https://dantri.com.vn/rss/home.rss")
            .then((data) => {
                setAllNews(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!query) {
            setFilteredNews([]);
            return;
        }

        const normalizedQuery = normalizeText(query);

        const results = allNews.filter(item => {
            const normalizedTitle = normalizeText(item.title);
            const normalizedDesc = normalizeText(item.description);

            // Tìm kiếm thông minh: khớp cả có dấu lẫn không dấu
            return normalizedTitle.includes(normalizedQuery) ||
                normalizedDesc.includes(normalizedQuery);
        });

        setFilteredNews(results);
    }, [query, allNews]);

    if (loading) return <div style={{textAlign: 'center', padding: '50px'}}>Đang lục tìm kho tin tức...</div>;

    return (
        <div className="search-results" style={{ maxWidth: "1000px", margin: "0 auto" }}>
            <div className="container">
                <div style={{ padding: "20px", borderBottom: "1px solid #ddd", marginBottom: "20px" }}>
                    <h2 style={{ fontSize: "24px" }}>
                        Kết quả tìm kiếm cho: <span style={{ color: "#007bff" }}>"{query}"</span>
                    </h2>
                    <p style={{ color: "#666" }}>Tìm thấy {filteredNews.length} bài viết phù hợp.</p>
                </div>

                {filteredNews.length > 0 ? (
                    <LatestNews
                        newsList={filteredNews}
                        title={`Tin tức liên quan đến "${query}"`}
                    />
                ) : (
                    <div style={{ textAlign: "center", padding: "100px 20px" }}>
                        <div style={{ fontSize: "50px", marginBottom: "20px" }}>🔍</div>
                        <h3>Rất tiếc, không tìm thấy tin nào!</h3>
                        <p>Hãy thử từ khóa khác như "Thời sự", "Kinh tế" hoặc "Bóng đá".</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchPage;
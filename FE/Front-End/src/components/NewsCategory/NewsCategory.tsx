import { useEffect, useState } from "react";
import { fetchRSS } from "../../services/rssService";
import { NewsItem } from "../../types/news";
import "./NewsCategory.css"; // Bạn tự tạo file css rỗng hoặc copy css cũ

interface NewsCategoryProps {
    title: string;
    rssUrl: string;
}

const NewsCategory = ({ title, rssUrl }: NewsCategoryProps) => {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            const data = await fetchRSS(rssUrl);
            setNews(data);
            setLoading(false);
        };
        loadData();
    }, [rssUrl]); // Chạy lại khi URL thay đổi

    if (loading) return <div style={{padding: '40px', textAlign: 'center'}}>Đang tải tin tức...</div>;

    return (
        <div className="news-category-container" style={{maxWidth: '1200px', margin: '0 auto', padding: '20px'}}>
            <h2 className="cat-title" style={{ borderBottom: '2px solid #0e8f49', paddingBottom: '10px', marginBottom: '20px', textTransform: 'uppercase', color: '#0e8f49' }}>
                {title}
            </h2>

            <div className="news-list">
                {news.map((item, index) => (
                    <article key={index} style={{ display: 'flex', gap: '20px', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
                        <a href={item.link} target="_blank" rel="noreferrer" style={{flexShrink: 0}}>
                            <img src={item.image} alt={item.title} style={{ width: '240px', height: '160px', objectFit: 'cover', borderRadius: '4px' }} />
                        </a>
                        <div className="news-info">
                            <h3 style={{ marginTop: 0, fontSize: '18px' }}>
                                <a href={item.link} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: '#333', fontWeight: 'bold' }}>
                                    {item.title}
                                </a>
                            </h3>
                            <div style={{fontSize: '13px', color: '#888', marginBottom: '10px'}}>{new Date(item.pubDate).toLocaleString('vi-VN')}</div>
                            <p style={{ color: '#555', lineHeight: '1.5' }}>{item.description}</p>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
};

export default NewsCategory;
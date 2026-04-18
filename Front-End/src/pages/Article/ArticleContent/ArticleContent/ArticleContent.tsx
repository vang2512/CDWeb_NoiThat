import "./ArticleContent.css"
import ArticleConnect from "../ArticleConnect/ArticleConnect";
import ArticleSingular from "../ArticleSingular/ArticleSingular";
import ArticleSidebar from "../ArticleSidebar/ArticleSidebar";
import { NewsItem } from "../../../../types/news";

interface Props {
    article: NewsItem;
    loading: boolean;
    fullContent: string;
    authorName: string;
    authorAvatar: string;
    categoryName: string;
    hotNews: NewsItem[];
}

function ArticleContent({ article, loading, fullContent, authorName, authorAvatar, categoryName, hotNews }: Props) {
    return (
        <div className="body-container">
            <ArticleConnect/>

            <div className="grid-container">
                {/* Nội dung chính giữa trang bài báo */}
                <ArticleSingular article={article} loading={loading} fullContent={fullContent} authorName={authorName} authorAvatar={authorAvatar} />

                {/* Nội dung bên phải trang bài báo */}
                <ArticleSidebar categoryName={categoryName} hotNews={hotNews} />
            </div>
        </div>
    );
}

export default ArticleContent;
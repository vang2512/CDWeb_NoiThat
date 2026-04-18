import "./ArticleMain.css";
import ArticleHeader from "../ArticleHeader/ArticleHeader";
import ArticleContent from "../ArticleContent/ArticleContent";
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

function ArticleMain({ article, loading, fullContent, authorName, authorAvatar, categoryName, hotNews }: Props) {
    return(
        <main className="body container">
            {/* Header */}
            <ArticleHeader article={article} />

            {/* Content */}
            <ArticleContent article={article} loading={loading} fullContent={fullContent} authorName={authorName} authorAvatar={authorAvatar} categoryName={categoryName} hotNews={hotNews} />
        </main>
    );
}

export default ArticleMain;
import "./ArticleHeader.css";
import { NewsItem } from "../../../../types/news";
import { SLUG_TO_TITLE } from "../../../../types/news";

interface Props {
    article: NewsItem;
}

function ArticleHeader({ article }: Props) {
    const getBreadcrumbs = () => {
        try {
            const url = new URL(article.link);
            return url.pathname.split('/').filter(s => s && !s.endsWith(".htm"));
        } catch { return []; }
    };

    const breadcrumbs = getBreadcrumbs();

    return (
        <div className="dt-items-center">
            <ul className="dt-breadcrumb-list" style={{display: 'flex', listStyle: 'none', gap: '6px'}}>
                <li><a href="/">TRANG CHỦ</a></li>
                {breadcrumbs.map((slug, index) => (
                    <li key={index}>
                        <span style={{marginRight: '6px'}}> {">"}</span>
                        <a className="dt-uppercase" href={`/${slug}`}>
                            {SLUG_TO_TITLE[slug] || slug.toUpperCase().replace(/-/g, " ")}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default ArticleHeader;
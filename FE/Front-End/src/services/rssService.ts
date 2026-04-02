import { NewsItem } from "../types/news";
import {CATEGORY_MAP} from "../types/news";

const FALLBACK_DATA: NewsItem[] = [
    {
        title: "Lỗi 404: Link RSS không tồn tại hoặc bị sai",
        link: "#",
        pubDate: new Date().toUTCString(),
        description: "Vui lòng kiểm tra lại đường dẫn RSS.",
        image: "https://placehold.co/600x400/red/white?text=Check+Link"
    }
];

// Thời gian lưu cache (ví dụ: 5 phút = 300,000ms)
const CACHE_TIME = 30 * 60 * 1000;

export const fetchRSS = async (url: string): Promise<NewsItem[]> => {
    // 1. Kiểm tra Cache trong LocalStorage trước khi gọi API
    const cached = localStorage.getItem(`rss_cache_${url}`);
    const cachedTimestamp = localStorage.getItem(`rss_ts_${url}`);
    const now = Date.now();

    if (cached && cachedTimestamp && now - Number(cachedTimestamp) < CACHE_TIME) {
        console.log(`🚀 Lấy từ Cache: ${url}`);
        return JSON.parse(cached);
    }

    const PROXY_URL = "https://api.allorigins.win/raw?url=";

    try {
        const response = await fetch(PROXY_URL + encodeURIComponent(url));
        if (!response.ok) throw new Error(`Lỗi HTTP: ${response.status}`);

        const text = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, "text/xml");

        if (xmlDoc.querySelector("parsererror")) throw new Error("Lỗi XML");

        const items = Array.from(xmlDoc.querySelectorAll("item")).map((item) => {
            const getTxt = (tag: string) => item.querySelector(tag)?.textContent || "";
            const descHtml = getTxt("description");

            const div = document.createElement("div");
            div.innerHTML = descHtml;

            let img = div.querySelector("img")?.src;
            if (!img) img = "https://placehold.co/600x400?text=News";

            let cleanDesc = div.textContent || "";
            cleanDesc = cleanDesc.replace("(Dân trí) - ", "").trim();
            if (cleanDesc.length > 150) cleanDesc = cleanDesc.substring(0, 150) + "...";

            return {
                title: getTxt("title"),
                link: getTxt("link"),
                pubDate: getTxt("pubDate"),
                description: cleanDesc,
                image: img
            };
        });

        // 2. Lưu vào Cache sau khi fetch thành công
        localStorage.setItem(`rss_cache_${url}`, JSON.stringify(items));
        localStorage.setItem(`rss_ts_${url}`, now.toString());

        return items;
    } catch (error) {
        console.error(`🔥 Lỗi tải:`, error);
        return FALLBACK_DATA;
    }
};


// Hàm lấy nội dung chi tiết bài báo từ link gốc
export const fetchFullArticle = async (url: string): Promise<string> => {
    const PROXY_URL = "https://api.allorigins.win/raw?url=";

    try {
        const response = await fetch(PROXY_URL + encodeURIComponent(url));
        if (!response.ok) throw new Error("Không thể tải nội dung");
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        // Chọn vùng chứa nội dung chính của Dân trí
        const container = doc.querySelector(".singular-content");

        if (!container) return "Không thể bóc tách nội dung. Vui lòng xem tại nguồn gốc.";

        // XỬ LÝ HÌNH ẢNH
        const images = container.querySelectorAll("img");
        images.forEach(img => {
            // 1. Lấy link ảnh thật từ data-src (Dân trí dùng lazyload)
            const realSrc = img.getAttribute("data-src") || img.getAttribute("src");
            if (realSrc) {
                // Chuyển link tương đối thành tuyệt đối nếu cần
                img.src = realSrc.startsWith("http") ? realSrc : `https://dantri.com.vn${realSrc}`;
            }
            // 2. Xóa bỏ srcset để tránh trình duyệt tải ảnh lỗi
            img.removeAttribute("srcset");
            // 3. Đảm bảo ảnh hiển thị tốt
            img.style.maxWidth = "100%";
            img.style.height = "auto";
        });

        // LOẠI BỎ RÁC (Quảng cáo, bài liên quan trong nội dung)
        const junk = container.querySelectorAll(".z-news-suggest, .m-t-20, .video-player, .content-tag, .banner-ads");
        junk.forEach(el => el.remove());

        return container.innerHTML; // Trả về toàn bộ HTML bao gồm thẻ p, figure, img...

    } catch (error) {
        console.error("Scraping error:", error);
        return "Lỗi khi tải nội dung bài viết.";
    }
};

export interface FullArticleAuthor {
    content: string;
    authorName: string;
    authorAvatar: string;
}

export const fetchFullAuthor = async (url: string): Promise<FullArticleAuthor> => {
    const PROXY_URL = "https://api.allorigins.win/raw?url=";

    try {
        const response = await fetch(PROXY_URL + encodeURIComponent(url));
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        // 1. Lấy nội dung chính
        const container = doc.querySelector(".singular-content, .article-body");

        // 2. Lấy Tên Tác Giả (Dân trí thường để ở cuối bài hoặc trong meta)
        const authorNode = doc.querySelector(".author-name, .author-wrap b, .singular-author span");
        const authorName = authorNode?.textContent?.trim() || "Dân trí";

        // 3. Lấy Ảnh Tác Giả
        const avatarNode = doc.querySelector(".author-avatar img") as HTMLImageElement;
        let authorAvatar = avatarNode?.src || avatarNode?.getAttribute("data-src") || avatarNode?.getAttribute("src") || "";

        // Nếu không có ảnh, dùng ảnh mặc định
        if (!authorAvatar) {
            authorAvatar = "https://avatar.talk.zdn.vn/default.jpg";
        }

        // Xử lý ảnh trong nội dung bài viết (như đã làm ở bước trước)
        if (container) {
            container.querySelectorAll("img").forEach(img => {
                const realSrc = img.getAttribute("data-src") || img.getAttribute("src");
                if (realSrc) {
                    img.src = realSrc.startsWith("http") ? realSrc : `https://dantri.com.vn${realSrc}`;
                }
            });
        }

        return {
            content: container?.innerHTML || "Nội dung đang được cập nhật...",
            authorName,
            authorAvatar
        };
    } catch (error) {
        return {
            content: "Lỗi khi tải nội dung.",
            authorName: "Dân trí",
            authorAvatar: ""
        };
    }
};

export const fetchNewsByCategory = async (category: string): Promise<NewsItem[]> => {
    try {
        const slug = CATEGORY_MAP[category] || category.toLowerCase();

        const PROXY_URL = "https://api.allorigins.win/raw?url=";
        const rssUrl = `https://dantri.com.vn/rss/${slug}.rss`;

        const response = await fetch(PROXY_URL + encodeURIComponent(rssUrl));
        const xmlText = await response.text();

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "text/xml");
        const items = xmlDoc.querySelectorAll("item");

        return Array.from(items).map(item => {
            const descHtml = item.querySelector("description")?.textContent || "";
            const tmpDiv = document.createElement("div");
            tmpDiv.innerHTML = descHtml;

            const img = tmpDiv.querySelector("img")?.src || "";
            let cleanDesc = tmpDiv.textContent?.replace("(Dân trí) - ", "").trim() || "";

            return {
                title: item.querySelector("title")?.textContent || "",
                link: item.querySelector("link")?.textContent || "",
                pubDate: item.querySelector("pubDate")?.textContent || "",
                description: cleanDesc.length > 150 ? cleanDesc.substring(0, 150) + "..." : cleanDesc,
                image: img || "https://placehold.co/600x400?text=News",
                category: category || "Thời sự"
            };
        });
    } catch (error) {
        console.error("Lỗi khi fetch RSS theo danh mục:", error);
        return [];
    }
};
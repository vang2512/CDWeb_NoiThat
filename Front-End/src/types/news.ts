export interface NewsItem {
    title: string;
    link: string;
    pubDate: string;
    description: string;
    image?: string;
    category?: string;
    html?: string | null;
}

// Định nghĩa URL cho các chuyên mục để dễ quản lý
// export const RSS_URLS = {
//     // LƯU Ý: Trang chủ Dân Trí KHÔNG có chữ "/rss/" ở giữa
//     HOME: "https://dantri.com.vn/rss/home.rss",
//     // Các mục con thì PHẢI có chữ "/rss/" ở giữa
//     SPORT: "https://dantri.com.vn/rss/the-thao.rss",
//     ENTERTAINMENT: "https://dantri.com.vn/rss/giai-tri.rss",
//
//     // Các mục khác (tham khảo)
//     EDUCATION: "https://dantri.com.vn/rss/giao-duc.rss",
//     SOCIETY: "https://dantri.com.vn/rss/xa-hoi.rss"
// };

export const SLUG_TO_TITLE: Record<string, string> = {
    "moi-nhat": "Mới nhất",
    "thoi-su": "Thời sự",
    "the-gioi": "Thế giới",
    "kinh-te": "Kinh tế",
    "bat-dong-san": "Bất động sản",
    "lao-dong-viec-lam": "Lao động - Việc làm",
    "gia-vang": "Giá vàng",
    "xo-so": "Xổ số",
    "doi-song": "Đời sống",
    "suc-khoe": "Sức khỏe",
    "tinh-yeu-gioi-tinh": "Tình yêu - Giới tính",
    "tam-long-nhan-ai": "Nhân ái",
    "giao-duc": "Giáo dục",
    "khoa-hoc": "Khoa học",
    "the-thao": "Thể thao",
    "giai-tri": "Giải trí",
    "du-lich": "Du lịch",
    "o-to-xe-may": "Ô tô - Xe máy",
    "cong-nghe": "Công nghệ",
    "phap-luat": "Pháp luật",
    "ban-doc": "Bạn đọc",
    "noi-vu": "Nội vụ",
    "home": "Trang chủ"
};

// Map từ Tên hiển thị sang Slug (Dùng cho hàm fetchRSS theo danh mục)
export const CATEGORY_MAP: Record<string, string> = {
    "Trang chủ": "home",
    "Mới nhất": "tin-moi-nhat",
    "Thời sự": "xa-hoi",
    "Pháp luật": "phap-luat",
    "Thế giới": "the-gioi",
    "Kinh tế": "kinh-doanh",
    "Bất động sản": "bat-dong-san",
    "Giáo dục": "giao-duc",
    "Thể thao": "the-thao",
    "Giải trí": "giai-tri",
    "Sức khỏe": "suc-khoe",
    "Công nghệ": "cong-nghe",
    "Du lịch": "du-lich"
};
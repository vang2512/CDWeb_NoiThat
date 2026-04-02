import React, { useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./LatestNews.css";

interface LatestNewsProps {
    newsList: any[];
    title: string;
}

const LatestNews = ({ newsList, title }: LatestNewsProps) => {
    const navigate = useNavigate();

    const toInternalLink = (link: string) => {
        return link.replace("https://dantri.com.vn", "");
    };

    const goDetail = (article: any) => {
        // toInternalLink trả về dạng: /the-thao/bai-bao-abc.htm
        const internalPath = toInternalLink(article.link);

        // Thêm tiền tố /tin-tuc vào trước
        navigate(`/tin-tuc${internalPath}`, {
            state: article
        });
    };

    const formatTitle = (str: string) => {
        if (!str) return "";
        return str
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const formatVietnameseDate = (dateStr: string) => {
        if (!dateStr) return "Vừa xong";
        try {
            const date = new Date(dateStr);
            // Kiểm tra xem date có hợp lệ không
            if (isNaN(date.getTime())) return dateStr;

            return date.toLocaleString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false // Sử dụng định dạng 24h
            });
        } catch (e) {
            return dateStr;
        }
    };

    const [searchParams, setSearchParams] = useSearchParams();

    // Sử dụng useRef để theo dõi tiêu đề cũ, giúp nhận biết khi nào chuyên mục thực sự thay đổi
    const prevTitleRef = useRef(title);

    const currentPage = parseInt(searchParams.get("page") || "1");
    const itemsPerPage = 10;

    // Sửa logic reset trang: Chỉ reset về 1 khi người dùng đổi hẳn sang chuyên mục khác
    useEffect(() => {
        if (prevTitleRef.current !== title) {
            setSearchParams({ page: "1" }, { replace: true });
            prevTitleRef.current = title; // Cập nhật title mới vào ref
        }
    }, [title, setSearchParams]); // Đã thêm setSearchParams vào dependency để hết cảnh báo ESLint

    const paginate = (pageNumber: number) => {
        setSearchParams({ page: pageNumber.toString() });
        // Cuộn lên đầu một cách mượt mà
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const totalPages = Math.ceil(newsList.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = newsList.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <section className="latest-news">
            <h2 className="latest-title">{formatTitle(title)}</h2>
            <div className="latest-list">

                {currentItems.length > 0 ? (
                    <>
                        {currentItems.map((item, index) => (
                            <article key={index} className="latest-item">
                                <div className="latest-left">
                                    {/* Tìm đoạn này trong currentItems.map */}
                                    <span className="latest-time">
                                         <i className="far fa-clock"></i> {formatVietnameseDate(item.pubDate)}
                                    </span>

                                    <h3 className="latest-item-title" onClick={() => goDetail(item)} style={{ cursor: "pointer" }}>
                                        {item.title}
                                    </h3>
                                    <p className="latest-desc">{item.description}</p>
                                </div>
                                <div className="latest-right">
                                    <img src={item.image} alt={item.title} loading="lazy" onClick={() => goDetail(item)} style={{ cursor: "pointer" }} />
                                </div>
                            </article>
                        ))}

                        {totalPages > 1 && (
                            <div className="pagination">
                                <button
                                    onClick={() => paginate(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="page-node prev-next"
                                >
                                    &laquo; Trước
                                </button>

                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => paginate(i + 1)}
                                        className={`page-node ${currentPage === i + 1 ? "active" : ""}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}

                                <button
                                    onClick={() => paginate(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="page-node prev-next"
                                >
                                    Sau &raquo;
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <p className="no-data">Không có dữ liệu cho mục này hoặc đang tải...</p>
                )}
            </div>
        </section>
    );
};

export default LatestNews;
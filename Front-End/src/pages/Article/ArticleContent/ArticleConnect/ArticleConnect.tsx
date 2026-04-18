import "./ArticleConnect.css"
import { useNavigate } from "react-router-dom";

function ArticleConnect() {
    const navigate = useNavigate();
    const shareUrl = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);

    // Chia sẻ Facebook
    const shareFacebook = (e: React.MouseEvent) => {
        e.preventDefault();
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`, '_blank', 'width=600,height=400');
    };

    // Chia sẻ Twitter (X)
    const shareTwitter = (e: React.MouseEvent) => {
        e.preventDefault();
        window.open(`https://twitter.com/intent/tweet?url=${shareUrl}&text=${title}`, '_blank', 'width=600,height=400');
    };

    // Chia sẻ LinkedIn
    const shareLinkedIn = (e: React.MouseEvent) => {
        e.preventDefault();
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`, '_blank', 'width=600,height=400');
    };

    // Chia sẻ Zalo
    const shareZalo = () => {
        window.open(`https://sp.zalo.me/share/base?url=${shareUrl}`, '_blank', 'width=600,height=400');
    };

    // Xử lý in bài báo
    const handlePrint = (e: React.MouseEvent) => {
        e.preventDefault();
        window.print();
    };

    // Xử lý Copy Link
    const handleCopyLink = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        alert("Đã sao chép đường dẫn bài viết!");
    };

    // Di chuyển đến phần bình luận
    const scrollToComments = () => {
        const commentElement = document.querySelector(".article-comments-zone");

        if (commentElement) {
            commentElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    // Quay lại trang trước
    const handleBack = () => {
        navigate(-1);
    };

    return (
        <div className="side-bar-height">
            <ul className="button-action social-pin">
                {/*Kết nối tới facebook*/}
                <li>
                    <a className="action-item facebook" href="#" title="Chia sẻ bài viết lên facebook" onClick={shareFacebook}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none"
                             className="bi bi-facebook">
                            <rect x="0.6" y="0.6" width="30.8" height="30.8" rx="15.4" fill="#FFF"></rect>
                            <rect x="0.6" y="0.6" width="30.8" height="30.8" rx="15.4" stroke="#E3E6E8"
                                  stroke-width="1.2"></rect>
                            <path
                                d="M16.5 13.04v2.32h2.34c.18 0 .27.16.27.32l-.36 1.52c0 .08-.18.16-.27.16H16.5v5.84h-2.7v-5.76h-1.53c-.18 0-.27-.08-.27-.24v-1.52c0-.16.09-.24.27-.24h1.53V12.8c0-1.36 1.17-2.4 2.7-2.4h2.43c.18 0 .27.08.27.24v1.92c0 .16-.09.24-.27.24h-2.16c-.18 0-.27.08-.27.24Z"
                                fill="#000"></path>
                        </svg>
                    </a>
                </li>

                {/* Kết nối tới twitter */}
                <li>
                    <a className="action-item twitter" href="#" title="Chia sẻ bài viết lên twitter" onClick={shareTwitter}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="33" fill="none"
                             className="bi bi-twitter-x">
                            <rect x="0.6" y="1.1" width="30.8" height="30.8" rx="15.4" fill="#FFF"></rect>
                            <rect x="0.6" y="1.1" width="30.8" height="30.8" rx="15.4" stroke="#E3E6E8"
                                  stroke-width="1.2"></rect>
                            <path
                                d="M17.332 15.428 22.544 9.5h-1.235l-4.526 5.147L13.17 9.5H9l5.466 7.784L9 23.5h1.235l4.78-5.436L18.83 23.5H23l-5.668-8.072ZM10.68 10.41h1.897l8.732 12.222h-1.897L10.68 10.41Z"
                                fill="#000" stroke="#000" stroke-width="0.5"></path>
                        </svg>
                    </a>
                </li>

                {/* Kết nối tới linkedin */}
                <li>
                    <a className="action-item linkedin" href="#" title="Chia sẻ bài viết lên linkedin" onClick={shareLinkedIn}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none"
                             className="bi bi-linkedin">
                            <rect x="0.6" y="0.6" width="30.8" height="30.8" rx="15.4" fill="#FFF"></rect>
                            <rect x="0.6" y="0.6" width="30.8" height="30.8" rx="15.4" stroke="#E3E6E8"
                                  stroke-width="1.2"></rect>
                            <path
                                d="M23.3 8H8.7c-.4 0-.7.3-.7.7v14.7c0 .3.3.6.7.6h14.7c.4 0 .7-.3.7-.7V8.7c-.1-.4-.4-.7-.8-.7ZM12.7 21.6h-2.3V14h2.4v7.6h-.1ZM11.6 13c-.8 0-1.4-.7-1.4-1.4 0-.8.6-1.4 1.4-1.4.8 0 1.4.6 1.4 1.4-.1.7-.7 1.4-1.4 1.4Zm10 8.6h-2.4v-3.7c0-.9 0-2-1.2-2s-1.4 1-1.4 2v3.8h-2.4V14h2.3v1c.3-.6 1.1-1.2 2.2-1.2 2.4 0 2.8 1.6 2.8 3.6v4.2h.1Z"
                                fill="#000"></path>
                        </svg>
                    </a>
                </li>

                {/* Kết nối tới zalo */}
                <li>
                    <button className="action-item zalo" title="Chia sẻ bài viết lên zalo" onClick={shareZalo}>
                        <svg width="32" height="32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="0.533" y="0.533" width="30.933" height="30.933" rx="15.467" fill="#FFF"></rect>
                            <rect x="0.533" y="0.533" width="30.933" height="30.933" rx="15.467" stroke="#E3E6E8"
                                  stroke-width="1.067"></rect>
                            <path fill-rule="evenodd" clip-rule="evenodd"
                                  d="M16.363 14.687v-.342h.998v4.805h-.571a.432.432 0 0 1-.427-.436 2.382 2.382 0 0 1-1.435.481c-1.344 0-2.433-1.117-2.433-2.495 0-1.377 1.09-2.494 2.433-2.494a2.384 2.384 0 0 1 1.435.48ZM12.236 12.8v.156c0 .29-.037.527-.222.806l-.022.026a5.59 5.59 0 0 0-.179.216l-3.202 4.124h3.625v.584a.433.433 0 0 1-.427.438H7.111v-.276c0-.337.082-.487.185-.644l3.414-4.335H7.254V12.8h4.982Zm6.335 6.35a.36.36 0 0 1-.356-.365V12.8h1.068v6.35h-.712Zm3.869-4.974c1.353 0 2.45 1.125 2.45 2.511 0 1.387-1.097 2.513-2.45 2.513-1.353 0-2.45-1.126-2.45-2.513 0-1.386 1.097-2.511 2.45-2.511Zm-7.512 3.992c.79 0 1.431-.657 1.431-1.468 0-.81-.64-1.466-1.431-1.466-.79 0-1.432.657-1.432 1.466 0 .811.641 1.468 1.432 1.468Zm7.512-.002c.795 0 1.44-.662 1.44-1.479 0-.815-.645-1.477-1.44-1.477-.797 0-1.441.662-1.441 1.477 0 .817.644 1.479 1.44 1.479Z"
                                  fill="#000"></path>
                        </svg>
                    </button>
                </li>

                {/* Lấy đường dẫn liên kết */}
                <li>
                    <button type="button" className="action-item link" title="Copy" onClick={handleCopyLink}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none"
                             className="bi bi-link-45deg">
                            <rect x="0.6" y="0.6" width="30.8" height="30.8" rx="15.4" fill="#FFF"></rect>
                            <rect x="0.6" y="0.6" width="30.8" height="30.8" rx="15.4" stroke="#E3E6E8"
                                  stroke-width="1.2"></rect>
                            <path
                                d="m14.848 19.537-1.59 1.59a1.686 1.686 0 1 1-2.386-2.385l3.18-3.18a1.686 1.686 0 0 1 2.386 0 .562.562 0 0 0 .795-.795 2.81 2.81 0 0 0-3.975 0l-3.18 3.18a2.81 2.81 0 1 0 3.975 3.975l1.59-1.59a.562.562 0 0 0-.795-.795Z"
                                fill="#333"></path>
                            <path
                                d="m14.848 19.537-1.59 1.59a1.686 1.686 0 1 1-2.386-2.385l3.18-3.18a1.686 1.686 0 0 1 2.386 0 .562.562 0 0 0 .795-.795 2.81 2.81 0 0 0-3.975 0l-3.18 3.18a2.81 2.81 0 1 0 3.975 3.975l1.59-1.59a.562.562 0 0 0-.795-.795Z"
                                fill="#000" fill-opacity="0.2"></path>
                            <path
                                d="m14.848 19.537-1.59 1.59a1.686 1.686 0 1 1-2.386-2.385l3.18-3.18a1.686 1.686 0 0 1 2.386 0 .562.562 0 0 0 .795-.795 2.81 2.81 0 0 0-3.975 0l-3.18 3.18a2.81 2.81 0 1 0 3.975 3.975l1.59-1.59a.562.562 0 0 0-.795-.795Z"
                                stroke="#333" stroke-width="0.3"></path>
                            <path
                                d="m14.848 19.537-1.59 1.59a1.686 1.686 0 1 1-2.386-2.385l3.18-3.18a1.686 1.686 0 0 1 2.386 0 .562.562 0 0 0 .795-.795 2.81 2.81 0 0 0-3.975 0l-3.18 3.18a2.81 2.81 0 1 0 3.975 3.975l1.59-1.59a.562.562 0 0 0-.795-.795Z"
                                stroke="#000" stroke-opacity="0.2" stroke-width="0.3"></path>
                            <path
                                d="M21.925 10.076a2.811 2.811 0 0 0-3.976 0l-1.907 1.908a.562.562 0 0 0 .795.795l1.907-1.908a1.687 1.687 0 0 1 2.386 2.385l-3.498 3.498a1.686 1.686 0 0 1-2.385 0 .562.562 0 0 0-.795.795 2.81 2.81 0 0 0 3.975 0l3.498-3.498a2.81 2.81 0 0 0 0-3.975Z"
                                fill="#333"></path>
                            <path
                                d="M21.925 10.076a2.811 2.811 0 0 0-3.976 0l-1.907 1.908a.562.562 0 0 0 .795.795l1.907-1.908a1.687 1.687 0 0 1 2.386 2.385l-3.498 3.498a1.686 1.686 0 0 1-2.385 0 .562.562 0 0 0-.795.795 2.81 2.81 0 0 0 3.975 0l3.498-3.498a2.81 2.81 0 0 0 0-3.975Z"
                                fill="#000" fill-opacity="0.2"></path>
                            <path
                                d="M21.925 10.076a2.811 2.811 0 0 0-3.976 0l-1.907 1.908a.562.562 0 0 0 .795.795l1.907-1.908a1.687 1.687 0 0 1 2.386 2.385l-3.498 3.498a1.686 1.686 0 0 1-2.385 0 .562.562 0 0 0-.795.795 2.81 2.81 0 0 0 3.975 0l3.498-3.498a2.81 2.81 0 0 0 0-3.975Z"
                                stroke="#333" stroke-width="0.3"></path>
                            <path
                                d="M21.925 10.076a2.811 2.811 0 0 0-3.976 0l-1.907 1.908a.562.562 0 0 0 .795.795l1.907-1.908a1.687 1.687 0 0 1 2.386 2.385l-3.498 3.498a1.686 1.686 0 0 1-2.385 0 .562.562 0 0 0-.795.795 2.81 2.81 0 0 0 3.975 0l3.498-3.498a2.81 2.81 0 0 0 0-3.975Z"
                                stroke="#000" stroke-opacity="0.2" stroke-width="0.3"></path>
                        </svg>
                    </button>
                </li>

                {/* Di chuyển tới phần bình luận */}
                <li className="line">
                    <button type="button" className="action-item comment" title="Bình luận" onClick={scrollToComments}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none"
                             className="bi bi-chat-square-text-fill">
                            <rect x="0.6" y="0.6" width="30.8" height="30.8" rx="15.4" fill="#FFF"></rect>
                            <rect x="0.6" y="0.6" width="30.8" height="30.8" rx="15.4" stroke="#E3E6E8"
                                  stroke-width="1.2"></rect>
                            <path
                                d="M13.334 21.333h.333c.556 0 1 0 1.667.667.44.587 1.16.587 1.6 0 .48-.8 1.067-.667 1.733-.667 2.667 0 4-1.333 4-4V14c0-2.667-1.333-4-4-4h-5.333c-2.667 0-4 1.333-4 4v3.333c0 3.334 1.333 4 4 4Z"
                                stroke="#000" stroke-width="1.2" stroke-miterlimit="10" stroke-linecap="round"
                                stroke-linejoin="round"></path>
                            <path d="M12.666 14h6.667m-6.667 3.333h4" stroke="#000" stroke-width="1.2"
                                  stroke-linecap="round" stroke-linejoin="round"></path>
                        </svg>
                    </button>
                </li>

                {/* Lưu bài báo yêu thích */}
                <li>
                    <button type="button" className="action-item comment-empty_saved" title="Lưu bài viết">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none"
                             className="bi bi-bookmark">
                            <rect x="0.6" y="0.6" width="30.8" height="30.8" rx="15.4" fill="#FFF"></rect>
                            <rect x="0.6" y="0.6" width="30.8" height="30.8" rx="15.4" stroke="#E3E6E8"
                                  stroke-width="1.2"></rect>
                            <g transform="translate(8 7) scale(1)">
                                <path
                                    d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1z"
                                    fill="#000"/>
                            </g>
                        </svg>
                    </button>
                </li>

                {/* Vào chế độ in bài báo */}
                <li>
                    <a className="action-item print" href="#" title="In" onClick={handlePrint}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none"
                             className="bi bi-printer">
                            <rect x="0.6" y="0.6" width="30.8" height="30.8" rx="15.4" fill="#FFF"></rect>
                            <rect x="0.6" y="0.6" width="30.8" height="30.8" rx="15.4" stroke="#E3E6E8"
                                  stroke-width="1.2"></rect>
                            <path
                                d="M12.834 12.666h6.333v-1.333c0-1.333-.5-2-2-2h-2.333c-1.5 0-2 .667-2 2v1.333ZM22 14.667V18c0 1.334-.667 2-2 2v-1.6h-8V20c-1.333 0-2-.666-2-2v-3.333c0-1.333.667-2 2-2h8c1.333 0 2 .667 2 2ZM20 18.4h-8m.666-3.067h2"
                                stroke="#000" stroke-width="1.2" stroke-miterlimit="10" stroke-linecap="round"
                                stroke-linejoin="round"></path>
                            <path d="M20 18.4v2.286c0 1.143-1 1.714-3 1.714h-2c-2 0-3-.571-3-1.714V18.4h8Z"
                                  stroke="#000" stroke-width="1.2" stroke-miterlimit="10" stroke-linecap="round"
                                  stroke-linejoin="round"></path>
                        </svg>
                    </a>
                </li>

                {/* Nút quay lại (back) */}
                <li>
                    <button type="button" className="action-item back" title="Quay lại" onClick={handleBack}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none"
                             className="bi bi-arrow-left">
                            <rect x="0.6" y="0.6" width="30.8" height="30.8" rx="15.4" fill="#FFF"></rect>
                            <rect x="0.6" y="0.6" width="30.8" height="30.8" rx="15.4" stroke="#E3E6E8"
                                  stroke-width="1.2"></rect>
                            <path d="M14.38 11.953 10.335 16l4.047 4.047M21.667 16h-11.22" stroke="#292D32"
                                  stroke-width="1.2" stroke-miterlimit="10" stroke-linecap="round"
                                  stroke-linejoin="round"></path>
                        </svg>
                    </button>
                </li>
            </ul>
        </div>
    );
}

export default ArticleConnect;
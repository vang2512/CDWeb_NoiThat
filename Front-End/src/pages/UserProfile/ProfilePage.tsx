import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './ProfilePage.css';

// Định nghĩa kiểu dữ liệu cho Bình luận và Tin đã lưu
interface CommentItem {
    id: number;
    articleId: string;
    content: string;
    date: string;
    articleTitle?: string; // Tên bài viết (nếu có lưu)
}

interface SavedArticle {
    link: string;
    title: string;
    date: string;
    image?: string;
}

const ProfilePage = () => {
    const navigate = useNavigate();

    // --- STATE ---
    const [user, setUser] = useState({ name: '', contact: '', joinedDate: '' });
    const [activeTab, setActiveTab] = useState<'info' | 'saved' | 'comments'>('info'); // Tab đang chọn

    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState('');

    // Dữ liệu hoạt động
    const [myComments, setMyComments] = useState<CommentItem[]>([]);
    const [savedArticles, setSavedArticles] = useState<SavedArticle[]>([]);

    // --- LOAD DỮ LIỆU ---
    useEffect(() => {
        const loggedIn = localStorage.getItem('isLoggedIn');
        if (!loggedIn) {
            navigate('/');
            return;
        }

        // 1. Load User Info
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const originalUser = JSON.parse(localStorage.getItem('userAccount') || '{}');
        const phoneUser = JSON.parse(localStorage.getItem('my_phone_account') || '{}');

        let contactInfo = "Tài khoản Google/Khách";
        if (originalUser.email) contactInfo = originalUser.email;
        if (phoneUser.phone) contactInfo = phoneUser.phone;

        setUser({
            name: currentUser.name || "Người dùng",
            contact: contactInfo,
            joinedDate: "15/01/2026" // Giả lập ngày tham gia
        });
        setNewName(currentUser.name || "");

        // 2. Load Lịch sử bình luận (Lọc theo tên user hiện tại)
        const allComments = JSON.parse(localStorage.getItem('site_comments') || '[]');
        const userComments = allComments.filter((c: any) => c.username === currentUser.name);
        setMyComments(userComments.reverse()); // Đảo ngược để thấy cái mới nhất

        // 3. Load Tin đã lưu (Tạm thời lấy giả lập hoặc từ localStorage nếu bạn đã làm chức năng lưu)
        const saved = JSON.parse(localStorage.getItem('saved_articles') || '[]');
        setSavedArticles(saved);

    }, [navigate]);

    // --- XỬ LÝ LƯU TÊN ---
    const handleSaveName = () => {
        if (!newName.trim()) return alert("Tên không được để trống!");

        setUser({ ...user, name: newName });
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        currentUser.name = newName;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        // Cập nhật cả user gốc nếu cần
        const originalUser = JSON.parse(localStorage.getItem('userAccount') || '{}');
        if (originalUser.fullname) {
            originalUser.fullname = newName;
            localStorage.setItem('userAccount', JSON.stringify(originalUser));
        }

        alert("Đã cập nhật tên hiển thị!");
        setIsEditing(false);
        window.location.reload(); // Reload để header cập nhật
    };

    const handleLogout = () => {
        if (window.confirm("Đăng xuất khỏi thiết bị này?")) {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('currentUser');
            navigate('/');
            window.location.reload();
        }
    };

    // Xóa comment (Chỉ xóa trên giao diện profile, nâng cao thì xóa trong localStorage gốc)
    const handleDeleteComment = (id: number) => {
        if(window.confirm("Bạn muốn xóa bình luận này?")) {
            // Logic xóa thật trong LocalStorage hơi phức tạp, ở đây mình ẩn khỏi view thôi nhé
            const newComments = myComments.filter(c => c.id !== id);
            setMyComments(newComments);
            // TODO: Update lại localStorage 'site_comments' nếu muốn xóa vĩnh viễn
        }
    }

    return (
        <div className="profile-container">
            <div className="profile-wrapper">

                {/* --- CỘT TRÁI: SIDEBAR THÔNG TIN --- */}
                <div className="profile-sidebar">
                    <div className="sidebar-header">
                        <div className="avatar-circle">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <h3>{user.name}</h3>
                        <p className="user-role">Thành viên thân thiết</p>
                    </div>

                    <div className="sidebar-stats">
                        <div className="stat-item">
                            <strong>{myComments.length}</strong>
                            <span>Bình luận</span>
                        </div>
                        <div className="stat-item">
                            <strong>{savedArticles.length}</strong>
                            <span>Tin đã lưu</span>
                        </div>
                    </div>

                    <div className="sidebar-menu">
                        <button
                            className={activeTab === 'info' ? 'active' : ''}
                            onClick={() => setActiveTab('info')}
                        >
                            👤 Thông tin cá nhân
                        </button>
                        <button
                            className={activeTab === 'saved' ? 'active' : ''}
                            onClick={() => setActiveTab('saved')}
                        >
                            🔖 Tin đã lưu
                        </button>
                        <button
                            className={activeTab === 'comments' ? 'active' : ''}
                            onClick={() => setActiveTab('comments')}
                        >
                            💬 Lịch sử bình luận
                        </button>
                    </div>

                    <button className="logout-btn-side" onClick={handleLogout}>Đăng xuất</button>
                </div>

                {/* --- CỘT PHẢI: NỘI DUNG CHÍNH --- */}
                <div className="profile-content">

                    {/* TAB 1: THÔNG TIN */}
                    {activeTab === 'info' && (
                        <div className="tab-pane fade-in">
                            <h2 className="tab-title">Thông tin tài khoản</h2>
                            <div className="info-card">
                                <div className="form-group">
                                    <label>Tên hiển thị</label>
                                    <div className="input-with-btn">
                                        <input
                                            type="text"
                                            value={isEditing ? newName : user.name}
                                            disabled={!isEditing}
                                            onChange={(e) => setNewName(e.target.value)}
                                        />
                                        {isEditing ? (
                                            <div className="btn-group-small">
                                                <button className="save-mini" onClick={handleSaveName}>Lưu</button>
                                                <button className="cancel-mini" onClick={() => setIsEditing(false)}>Hủy</button>
                                            </div>
                                        ) : (
                                            <button className="edit-mini" onClick={() => setIsEditing(true)}>Sửa</button>
                                        )}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Email / Số điện thoại</label>
                                    <input type="text" value={user.contact} disabled className="disabled-input" />
                                </div>

                                <div className="form-group">
                                    <label>Ngày tham gia</label>
                                    <input type="text" value={user.joinedDate} disabled className="disabled-input" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: TIN ĐÃ LƯU */}
                    {activeTab === 'saved' && (
                        <div className="tab-pane fade-in">
                            <h2 className="tab-title">Tin tức đã lưu ({savedArticles.length})</h2>
                            {savedArticles.length > 0 ? (
                                <ul className="saved-list">
                                    {savedArticles.map((article, index) => (
                                        <li key={index} className="saved-item">
                                            <a href={article.link} target="_blank" rel="noreferrer" className="saved-link">
                                                {article.title}
                                            </a>
                                            <span className="saved-date">{article.date}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="empty-state">
                                    <p>Bạn chưa lưu bài viết nào.</p>
                                    <button onClick={() => navigate('/')}>Xem tin tức ngay</button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 3: LỊCH SỬ BÌNH LUẬN */}
                    {activeTab === 'comments' && (
                        <div className="tab-pane fade-in">
                            <h2 className="tab-title">Hoạt động bình luận ({myComments.length})</h2>
                            <div className="comments-history-list">
                                {myComments.length > 0 ? myComments.map(cmt => (
                                    <div key={cmt.id} className="history-item">
                                        <div className="history-header">
                                            <span className="history-date">{cmt.date}</span>
                                            {/* Link đến bài viết dựa trên ID (nếu ID là link) */}
                                            <a href={cmt.articleId} target="_blank" rel="noreferrer" className="history-link">
                                                Xem bài viết ↗
                                            </a>
                                        </div>
                                        <p className="history-content">"{cmt.content}"</p>
                                        <button className="delete-cmt-btn" onClick={() => handleDeleteComment(cmt.id)}>Xóa</button>
                                    </div>
                                )) : (
                                    <div className="empty-state">
                                        <p>Bạn chưa có bình luận nào.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
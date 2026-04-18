import React, { useState, useEffect } from 'react';
import './CommentSection.css';

interface Comment {
    id: number;
    articleId: string;
    username: string;
    content: string;
    date: string;
}

interface CommentSectionProps {
    articleId: string;
}

const CommentSection = ({ articleId }: CommentSectionProps) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        const userStr = localStorage.getItem('currentUser');
        if (userStr) setCurrentUser(JSON.parse(userStr));

        const allComments = JSON.parse(localStorage.getItem('site_comments') || '[]');
        const articleComments = allComments.filter((c: Comment) => c.articleId === articleId);
        setComments(articleComments);
    }, [articleId]);

    // --- HÀM KIỂM TRA ĐĂNG NHẬP ---
    const checkLogin = () => {
        if (!currentUser) {
            // Nếu chưa đăng nhập -> Bắn tín hiệu mở Modal Login
            window.dispatchEvent(new Event('OPEN_LOGIN_MODAL'));
            return false;
        }
        return true;
    };

    const handleSubmit = () => {
        // Kiểm tra login trước khi gửi
        if (!checkLogin()) return;

        if (!newComment.trim()) return;

        const newCmtObj: Comment = {
            id: Date.now(),
            articleId: articleId,
            username: currentUser.name,
            content: newComment,
            date: new Date().toLocaleString('vi-VN')
        };

        const updatedComments = [newCmtObj, ...comments];
        setComments(updatedComments);
        const allComments = JSON.parse(localStorage.getItem('site_comments') || '[]');
        allComments.push(newCmtObj);
        localStorage.setItem('site_comments', JSON.stringify(allComments));
        setNewComment('');
    };

    return (
        <div className="comment-section" style={{marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '20px'}}>
            <h3>Bình luận ({comments.length})</h3>

            <div style={{marginBottom: '20px'}}>
                {/* LOGIC MỚI Ở ĐÂY */}
                {currentUser ? (
                    // TRƯỜNG HỢP 1: ĐÃ ĐĂNG NHẬP (Hiện ô nhập bình thường)
                    <>
                        <p>Đang viết dưới tên: <strong>{currentUser.name}</strong></p>
                        <textarea
                            style={{width: '100%', padding: '10px', height: '80px', borderRadius: '5px', border:'1px solid #ccc'}}
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Bạn nghĩ gì về tin này?"
                        />
                        <button onClick={handleSubmit} style={{marginTop: '10px', padding: '8px 16px', background: '#007bff', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px'}}>
                            Gửi bình luận
                        </button>
                    </>
                ) : (
                    // TRƯỜNG HỢP 2: CHƯA ĐĂNG NHẬP (Hiện ô giả, nhấn vào là hiện Login)
                    <div
                        onClick={checkLogin} // Nhấn vào cả cụm này sẽ gọi login
                        style={{
                            padding: '20px',
                            background: '#f8f9fa',
                            border: '1px dashed #ccc',
                            textAlign: 'center',
                            cursor: 'pointer',
                            borderRadius: '8px'
                        }}
                    >
                        <p style={{marginBottom: '10px', color: '#666'}}>Bạn cần đăng nhập để gửi bình luận.</p>
                        <button style={{
                            padding: '10px 20px',
                            background: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}>
                            Đăng nhập / Đăng ký ngay
                        </button>
                    </div>
                )}
            </div>

            <div>
                {comments.map(cmt => (
                    <div key={cmt.id} style={{marginBottom: '15px', borderBottom: '1px solid #f0f0f0', paddingBottom: '10px'}}>
                        <div style={{fontWeight: 'bold', color: '#333'}}>{cmt.username} <span style={{fontWeight:'normal', fontSize:'12px', color:'#999'}}>- {cmt.date}</span></div>
                        <div style={{marginTop: '5px'}}>{cmt.content}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CommentSection;
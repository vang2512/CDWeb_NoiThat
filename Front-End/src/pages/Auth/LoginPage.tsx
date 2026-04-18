import React, { useState, useEffect } from 'react';

// Interface cho tài khoản Google
interface GoogleAccount {
    id: number;
    name: string;
    email: string;
    avatar: string;
}

interface LoginPageProps {
    onSwitch: () => void;
}

const LoginPage = ({ onSwitch }: LoginPageProps) => {
    const [viewMode, setViewMode] = useState<'default' | 'google_select' | 'phone'>('default');

    // 1. STATE CHO FORM ĐĂNG NHẬP THƯỜNG (QUAN TRỌNG)
    const [credentials, setCredentials] = useState({ contact: '', password: '' });

    // State cho đăng nhập SĐT qua OTP
    const [phoneData, setPhoneData] = useState({ phoneNumber: '', otp: '', step: 1 });

    // State lưu danh sách Google tìm thấy
    const [savedGoogleAccounts, setSavedGoogleAccounts] = useState<GoogleAccount[]>([]);

    // --- EFFECT: Load tài khoản Google đã lưu ---
    useEffect(() => {
        const storedGoogle = localStorage.getItem('my_google_account');
        if (storedGoogle) {
            setSavedGoogleAccounts([JSON.parse(storedGoogle)]);
        }
    }, []);

    // --- A. XỬ LÝ ĐĂNG NHẬP FORM THƯỜNG (SỬA LỖI Ở ĐÂY) ---
    const handleStandardLogin = (e: React.FormEvent) => {
        e.preventDefault(); // Chặn load lại trang

        // 1. Lấy thông tin người dùng đã đăng ký form thường
        const savedUser = JSON.parse(localStorage.getItem('userAccount') || '{}');

        // 2. Lấy thông tin người dùng đăng ký bằng SĐT (để cho phép đăng nhập bằng mật khẩu luôn)
        const savedPhoneUser = JSON.parse(localStorage.getItem('my_phone_account') || '{}');

        // Kiểm tra khớp thông tin (Check cả 2 kho dữ liệu)
        const isMatchStandard = (savedUser.contact === credentials.contact) && (savedUser.password === credentials.password);
        const isMatchPhone = (savedPhoneUser.phone === credentials.contact) && (savedPhoneUser.password === credentials.password);

        if (isMatchStandard) {
            alert(`✅ Đăng nhập thành công! Chào mừng ${savedUser.fullname}`);
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('currentUser', JSON.stringify({ name: savedUser.fullname }));
            window.location.reload();
        }
        else if (isMatchPhone) {
            alert(`✅ Đăng nhập thành công! Chào mừng ${savedPhoneUser.name}`);
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('currentUser', JSON.stringify({ name: savedPhoneUser.name }));
            window.location.reload();
        }
        else {
            alert("❌ Sai tên đăng nhập hoặc mật khẩu!");
        }
    };

    // --- B. XỬ LÝ LOGIN GOOGLE ---
    const loginWithGoogleAccount = (account: GoogleAccount) => {
        alert(`Đang đăng nhập vào: ${account.email}`);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', JSON.stringify({ name: account.name }));
        setTimeout(() => window.location.reload(), 1000);
    };

    // --- C. XỬ LÝ LOGIN SĐT (OTP) ---
    const handleSendOTP = () => {
        const registeredUser = JSON.parse(localStorage.getItem('my_phone_account') || '{}');

        if (phoneData.phoneNumber === registeredUser.phone) {
            alert(`SĐT chính xác! OTP gửi về ${phoneData.phoneNumber} là: 9999`);
            setPhoneData({ ...phoneData, step: 2 });
        } else {
            alert("❌ SĐT này chưa đăng ký hoặc nhập sai.");
        }
    };

    const handleVerifyOTP = () => {
        if (phoneData.otp === "9999") {
            const registeredUser = JSON.parse(localStorage.getItem('my_phone_account') || '{}');
            alert(`✅ Chào mừng ${registeredUser.name} quay trở lại!`);
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('currentUser', JSON.stringify({ name: registeredUser.name }));
            window.location.reload();
        } else {
            alert("❌ Mã OTP sai!");
        }
    };

    // --- GIAO DIỆN PHỤ: CHỌN GOOGLE ---
    const renderGoogleSelection = () => (
        <div className="google-auth-container">
            <h3 style={{textAlign: 'center', marginBottom:'20px'}}>Chọn tài khoản</h3>
            <div className="account-list">
                {savedGoogleAccounts.length > 0 ? (
                    savedGoogleAccounts.map(acc => (
                        <div key={acc.id} className="account-item" onClick={() => loginWithGoogleAccount(acc)}>
                            <div className="avatar-circle">{acc.avatar}</div>
                            <div className="account-info">
                                <span className="acc-name">{acc.name}</span>
                                <span className="acc-email">{acc.email}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <p style={{textAlign:'center', color:'#888', fontStyle:'italic', padding:'20px'}}>Chưa có tài khoản Google nào được lưu.</p>
                )}
                <div className="account-item" style={{borderTop: '1px solid #eee', marginTop:'10px'}}>
                    <div className="avatar-circle" style={{background: '#eee', color:'#555'}}>+</div>
                    <div className="account-info"><span className="acc-name">Sử dụng tài khoản khác</span></div>
                </div>
            </div>
            <p className="back-link" onClick={() => setViewMode('default')}>&larr; Quay lại</p>
        </div>
    );

    // --- GIAO DIỆN PHỤ: LOGIN SĐT ---
    const renderPhoneLogin = () => (
        <div className="phone-auth-container">
            <h3 style={{textAlign: 'center', marginBottom:'15px'}}>Đăng nhập bằng SĐT</h3>
            {phoneData.step === 1 ? (
                <>
                    <p style={{textAlign:'center', fontSize:'13px', color:'#666'}}>Nhập SĐT đã đăng ký để nhận OTP</p>
                    <input type="text" placeholder="Số điện thoại" value={phoneData.phoneNumber} onChange={(e) => setPhoneData({...phoneData, phoneNumber: e.target.value})} />
                    <button type="button" className="submit-btn" onClick={handleSendOTP}>Gửi Mã OTP</button>
                </>
            ) : (
                <>
                    <p style={{textAlign:'center', fontSize:'13px'}}>Nhập OTP (9999)</p>
                    <input type="text" placeholder="Nhập OTP" value={phoneData.otp} onChange={(e) => setPhoneData({...phoneData, otp: e.target.value})} />
                    <button type="button" className="submit-btn" onClick={handleVerifyOTP}>Xác Nhận</button>
                </>
            )}
            <p className="back-link" onClick={() => { setViewMode('default'); setPhoneData({...phoneData, step: 1}); }}>&larr; Quay lại</p>
        </div>
    );

    return (
        <div className="auth-form">
            {viewMode === 'google_select' ? renderGoogleSelection() :
                viewMode === 'phone' ? renderPhoneLogin() : (

                    // --- GIAO DIỆN CHÍNH (ĐÃ SỬA FORM) ---
                    <>
                        <h2>Đăng Nhập</h2>
                        <form onSubmit={handleStandardLogin}>
                            <input
                                type="text" placeholder="Email hoặc SĐT" required
                                value={credentials.contact}
                                onChange={(e) => setCredentials({...credentials, contact: e.target.value})}
                            />
                            <input
                                type="password" placeholder="Mật khẩu" required
                                value={credentials.password}
                                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                            />
                            <div style={{textAlign: 'right', fontSize: '12px', marginBottom: '15px'}}>
                                <span style={{color: '#007bff', cursor:'pointer'}}>Quên mật khẩu?</span>
                            </div>
                            <button type="submit" className="submit-btn">Đăng Nhập</button>
                        </form>

                        <div className="social-section">
                            <p>Hoặc đăng nhập bằng</p>
                            <div className="social-icons">
                                <div className="icon-item" title="Google" onClick={() => setViewMode('google_select')}>
                                    <svg width="22" height="22" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.562 2.684-3.875 2.684-6.615z" fill="#4285F4"></path><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.715H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"></path><path d="M3.964 10.71A5.41 5.41 0 0 1 3.964 7.29V4.958H.957C.346 6.173 0 7.547 0 9a9.004 9.004 0 0 0 .957 4.042l3.007-2.332z" fill="#FBBC05"></path><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.159 6.656 3.58 9 3.58z" fill="#EA4335"></path></svg>
                                </div>
                                <div className="icon-item" title="SĐT" onClick={() => setViewMode('phone')}>
                                    <span style={{fontSize: '20px'}}>📱</span>
                                </div>
                            </div>
                        </div>
                        <p className="auth-footer">Chưa có tài khoản? <span onClick={onSwitch} style={{color: '#007bff', cursor: 'pointer', fontWeight: 'bold'}}>Đăng ký ngay</span></p>
                    </>
                )}
        </div>
    );
};

export default LoginPage;
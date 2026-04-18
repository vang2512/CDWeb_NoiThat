import React, { useState } from 'react';

interface RegisterPageProps {
    onSwitch: () => void;
}

const RegisterPage = ({ onSwitch }: RegisterPageProps) => {
    const [viewMode, setViewMode] = useState('default');

    // 1. State cho Form thường (Đã thêm lại để bắt dữ liệu nhập vào)
    const [formData, setFormData] = useState({
        fullname: '',
        contact: '', // Email hoặc tên đăng nhập
        password: '',
        confirmPassword: ''
    });

    // 2. State cho quy trình SĐT
    const [phoneFlow, setPhoneFlow] = useState({ step: 1, phoneNumber: '', otp: '', newName: '', newPassword: '' });

    // --- A. XỬ LÝ ĐĂNG KÝ FORM THƯỜNG (SỬA LỖI Ở ĐÂY) ---
    const handleStandardRegister = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate cơ bản
        if (!formData.contact || !formData.password) return alert("Vui lòng điền đầy đủ thông tin!");
        if (formData.password !== formData.confirmPassword) return alert("Mật khẩu xác nhận không khớp!");

        // Lưu vào kho 'userAccount' (Dành cho login thường)
        localStorage.setItem('userAccount', JSON.stringify(formData));

        alert(`✅ Đăng ký thành công tài khoản: ${formData.contact}`);
        onSwitch(); // Chuyển sang trang Login
    };

    // --- B. XỬ LÝ ĐĂNG KÝ GOOGLE ---
    const handleGoogleRegister = () => {
        setViewMode('loading');
        setTimeout(() => {
            setViewMode('default');
            const googleData = {
                id: 999,
                name: "Nguyễn Văn Google",
                email: "nguyenvan.google@gmail.com",
                avatar: "G"
            };
            localStorage.setItem('my_google_account', JSON.stringify(googleData));
            alert(`✅ Đã liên kết Google: ${googleData.email}`);
            onSwitch();
        }, 1500);
    };

    // --- C. XỬ LÝ ĐĂNG KÝ SĐT ---
    const handleSendOTP = () => {
        if(phoneFlow.phoneNumber.length < 9) return alert("SĐT không hợp lệ");

        const existingPhone = JSON.parse(localStorage.getItem('my_phone_account') || '{}');
        if (existingPhone.phone === phoneFlow.phoneNumber) {
            return alert("SĐT này đã đăng ký rồi! Vui lòng đăng nhập.");
        }

        alert(`Mã OTP gửi về ${phoneFlow.phoneNumber} là: 5555`);
        setPhoneFlow({ ...phoneFlow, step: 2 });
    };

    const handleVerifyOTP = () => {
        if(phoneFlow.otp === "5555") {
            setPhoneFlow({ ...phoneFlow, step: 3 });
        } else {
            alert("❌ Mã OTP sai!");
        }
    };

    const handleFinalizePhoneRegister = () => {
        if(!phoneFlow.newName || !phoneFlow.newPassword) return alert("Điền đủ thông tin!");

        const newPhoneUser = {
            phone: phoneFlow.phoneNumber,
            name: phoneFlow.newName,
            password: phoneFlow.newPassword
        };
        localStorage.setItem('my_phone_account', JSON.stringify(newPhoneUser));
        alert("✅ Đăng ký SĐT thành công!");
        onSwitch();
    };

    // --- GIAO DIỆN SĐT ---
    const renderPhoneRegistration = () => (
        <div className="phone-auth-container">
            <h3 style={{textAlign: 'center', marginBottom: '15px'}}>Đăng Ký Bằng SĐT</h3>
            {phoneFlow.step === 1 && (
                <>
                    <input type="text" placeholder="Số điện thoại" value={phoneFlow.phoneNumber} onChange={(e) => setPhoneFlow({...phoneFlow, phoneNumber: e.target.value})} />
                    <button type="button" className="submit-btn" onClick={handleSendOTP}>Gửi Mã OTP</button>
                </>
            )}
            {phoneFlow.step === 2 && (
                <>
                    <p style={{textAlign:'center', fontSize:'13px'}}>OTP gửi về <b>{phoneFlow.phoneNumber}</b></p>
                    <input type="text" placeholder="Nhập mã OTP (5555)" value={phoneFlow.otp} onChange={(e) => setPhoneFlow({...phoneFlow, otp: e.target.value})} />
                    <button type="button" className="submit-btn" onClick={handleVerifyOTP}>Xác Thực</button>
                </>
            )}
            {phoneFlow.step === 3 && (
                <>
                    <p style={{textAlign:'center', fontSize:'13px', color:'#28a745'}}>Xác thực xong! Tạo thông tin:</p>
                    <input type="text" placeholder="Tên hiển thị" value={phoneFlow.newName} onChange={(e) => setPhoneFlow({...phoneFlow, newName: e.target.value})} />
                    <input type="password" placeholder="Mật khẩu mới" value={phoneFlow.newPassword} onChange={(e) => setPhoneFlow({...phoneFlow, newPassword: e.target.value})} />
                    <button type="button" className="submit-btn" onClick={handleFinalizePhoneRegister}>Hoàn Tất</button>
                </>
            )}
            <p style={{textAlign: 'center', marginTop: '15px', color: '#007bff', cursor:'pointer'}} onClick={() => { setViewMode('default'); setPhoneFlow({...phoneFlow, step: 1}); }}>&larr; Quay lại</p>
        </div>
    );

    return (
        <div className="auth-form">
            {viewMode === 'loading' ? (
                <div style={{textAlign: 'center', padding: '40px'}}><div className="spinner"></div><p>Đang xử lý...</p></div>
            ) : viewMode === 'phone' ? (
                renderPhoneRegistration()
            ) : (
                // --- GIAO DIỆN CHÍNH (ĐÃ SỬA LẠI INPUT VÀ FORM) ---
                <>
                    <h2>Đăng Ký</h2>
                    {/* Kết nối hàm handleStandardRegister vào form */}
                    <form onSubmit={handleStandardRegister}>
                        <input
                            type="text" placeholder="Họ tên" required
                            value={formData.fullname}
                            onChange={(e) => setFormData({...formData, fullname: e.target.value})}
                        />
                        <input
                            type="text" placeholder="Tên đăng nhập / Email" required
                            value={formData.contact}
                            onChange={(e) => setFormData({...formData, contact: e.target.value})}
                        />
                        <input
                            type="password" placeholder="Mật khẩu" required
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                        />
                        <input
                            type="password" placeholder="Xác nhận mật khẩu" required
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        />
                        <button type="submit" className="submit-btn">Đăng Ký</button>
                    </form>

                    <div className="social-section">
                        <p>Hoặc đăng ký bằng</p>
                        <div className="social-icons">
                            <div className="icon-item" title="Đăng ký Google" onClick={handleGoogleRegister}>
                                <svg width="22" height="22" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.562 2.684-3.875 2.684-6.615z" fill="#4285F4"></path><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.715H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"></path><path d="M3.964 10.71A5.41 5.41 0 0 1 3.964 7.29V4.958H.957C.346 6.173 0 7.547 0 9a9.004 9.004 0 0 0 .957 4.042l3.007-2.332z" fill="#FBBC05"></path><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.159 6.656 3.58 9 3.58z" fill="#EA4335"></path></svg>
                            </div>
                            <div className="icon-item" title="Đăng ký SĐT" onClick={() => setViewMode('phone')}><span style={{fontSize: '20px'}}>📱</span></div>
                        </div>
                    </div>
                    <p className="auth-footer">Đã có tài khoản? <span onClick={onSwitch} style={{color: '#007bff', cursor: 'pointer', fontWeight:'bold'}}>Đăng nhập ngay</span></p>
                </>
            )}
        </div>
    );
};
export default RegisterPage;
export const validateFullName = (value) => {
  if (!value.trim()) return "Vui lòng nhập họ tên";
  return "";
};

export const validatePhone = (value) => {
  if (!value.trim()) return "Vui lòng nhập số điện thoại";

  const phoneRegex = /^(0|\+84)[0-9]{9}$/;
  if (!phoneRegex.test(value)) return "Số điện thoại không hợp lệ";

  return "";
};

export const validatePassword = (value) => {
  if (!value) return "Vui lòng nhập mật khẩu";
  if (value.length < 6) return "Mật khẩu phải ≥ 6 ký tự";
  return "";
};

export const validateConfirmPassword = (password, confirm) => {
  if (!confirm) return "Vui lòng nhập lại mật khẩu";
  if (password !== confirm) return "Mật khẩu không khớp";
  return "";
};
export const validateEmail = (email) => {
  if (!email.trim()) return "Vui lòng nhập email";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Email không hợp lệ (VD: example@domain.com)";
  return "";
};
// Login
export const validateLoginEmail = (email) => {
  if (!email.trim()) return "Vui lòng nhập email";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Email không hợp lệ";
  return "";
};

export const validateLoginPassword = (password) => {
  if (!password.trim()) return "Vui lòng nhập mật khẩu";
  if (password.length < 6) return "Mật khẩu phải có ít nhất 6 ký tự";
  return "";
};
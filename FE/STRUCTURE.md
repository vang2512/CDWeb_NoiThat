# Cấu trúc thư mục dự án (Project Structure)

Dự án hiện tại được chia thành các thư mục con trong `src/` nhằm tổ chức code một cách khoa học, dễ bảo trì và mở rộng:

- `assets/`: Chứa các tài nguyên tĩnh như hình ảnh, biểu tượng (icons), fonts, logo ứng dụng...
- `components/`: Nơi chứa các React components nhỏ, độc lập, có thể tái sử dụng nhiều lần (Ví dụ: `Button`, `Input`, `Card`, `Modal`...).
- `layouts/`: Chứa các bố cục khung của trang web (Ví dụ: `Header`, `Footer`, `Sidebar`, `MainLayout`). Các layout này bao bọc xung quanh nội dung trang cụ thể.
- `pages/`: Nơi chứa mã nguồn cho từng trang (màn hình) cụ thể của ứng dụng.
  - `Home/`: Lên lịch, tìm kiếm tổng quan, thông tin chung.
  - `Login/`: Màn hình Đăng nhập.
  - `Register/`: Màn hình Đăng ký/Tạo tài khoản.
  - `Doctor/`: Xem danh sách và thông tin chi tiết bác sĩ.
  - `Booking/`: Màn hình với quy trình đặt lịch khám bệnh.
  - `Profile/`: Trang cá nhân của user, bao gồm lịch sử khám bệnh.
- `services/`: Nơi chứa các file cấu hình và hàm gọi API giao tiếp với Backend (Ví dụ: axios config, `authService.js`, `userService.js`...).
- `hooks/`: Nơi chứa các custom React hooks để xử lý logic có thể tái sử dụng (Ví dụ: `useAuth`, `useFetch`, `useForm`).
- `context/`: Quản lý trạng thái toàn cục (global state) của ứng dụng, thường dùng React Context API (Ví dụ: `AuthContext` lưu thông tin người dùng đang đăng nhập).
- `routes/`: Cấu hình danh sách các tuyến đường (Router), xác định URL nào sẽ render Component (Page) nào. Có thể bao gồm cả bảo vệ tuyến đường (Private Route).
- `utils/`: Các hàm hỗ trợ, helper functions (Ví dụ: hàm định dạng ngày tháng, hàm format tiền tệ, validation...).

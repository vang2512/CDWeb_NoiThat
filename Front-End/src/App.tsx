import { Routes, Route, useLocation, Outlet } from "react-router-dom";
import Login from "./pages/Auth/Login/Login";
import Register from "./pages/Auth/Register/Register";
import Home from "./pages/Auth/Home/Home";
import Cart from "./pages/Auth/Cart/Cart";
import ProductDetail from "./pages/Auth/ProductDetail/ProductDetail";
import Profile from "./pages/Auth/Profile/Profile";
import Productreview from "./pages/Auth/ProductReview/ProductReview";
import AllProductPage from "./pages/Auth/AllProductPage/AllProductPage";
import OrderDetail from "./pages/Auth/OrderDetailPage/OrderDetail";
import Checkout from "./pages/Auth/CheckOut/Checkout";
import Payment from "./pages/Auth/Payment/Payment";
import OrderSuccess from "./pages/Auth/OrderSuccess/OrderSuccess";
import Header from "./components/header/Header";
import Footer from "./components/Footer/Footer";
import { CartProvider } from "./pages/Auth/CartContext";
import ForgotPassword from "./pages/Auth/ForgotPass/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPass/ResetPassword";
import StoreAddress from "./pages/Auth/StoreAddress/StoreAddress";
import { Toaster } from "react-hot-toast";
import "./i18n";
import AdminLayout from "./pages/Admin/AdminLayout";

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const hideFooter =
    location.pathname === "/login" ||
    location.pathname === "/forgot-password" ||
    location.pathname === "/order-success" ||
    location.pathname === "/register" ||
    isAdminRoute;
  return (
    <>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            borderRadius: "10px",
            padding: "12px 16px",
            color: "#fff",
            fontSize: "14px",
          },

          success: {
            style: {
              background: "#22c55e",
            },
            iconTheme: {
              primary: "#fff",
              secondary: "#22c55e",
            },
          },

          error: {
            style: {
              background: "#ef4444",
            },
            iconTheme: {
              primary: "#fff",
              secondary: "#ef4444",
            },
          },
        }}
      />


      {/* // Các trang */}
      {!isAdminRoute && <Header />}
<CartProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/store" element={<StoreAddress />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/check-out" element={<Checkout/>} />
        <Route path="/payment" element={<Payment/>} />
        <Route path="/order-success" element={<OrderSuccess/>} />
        <Route path="/product-detail/:id" element={<ProductDetail />} />
        <Route path="/product-review/:id" element={<Productreview />} />
        <Route path="/all-product/:id" element={<AllProductPage />} />
        <Route path="/order-detail/:id" element={<OrderDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin/*" element={<AdminLayout><Outlet /></AdminLayout>} />
      </Routes>
</CartProvider>

      {!hideFooter && <Footer />}
    </>
  );
}

export default App;
import axiosClient from "../axiosClient";

const adminApi = {

    // ================= DASHBOARD =================
    getDashboardStats() {
        return axiosClient.get("/admin/dashboard/stats");
    },

    getRevenueByMonth(year) {
        return axiosClient.get(`/admin/dashboard/revenue-by-month?year=${year}`);
    },

    getRevenueByCategory(year) {
        return axiosClient.get(`/admin/dashboard/revenue-by-category?year=${year}`);
    },

    getTopSellingProducts(year) {
        return axiosClient.get(`/admin/dashboard/top-selling-products?year=${year}`);
    },

    getCategoryStatistics() {
        return axiosClient.get("/admin/dashboard/category-statistics");
    },

    getRecentOrders() {
        return axiosClient.get("/admin/dashboard/recent-orders");
    },

    getLogs(params) {
        return axiosClient.get("/admin/logs", { params });
    },

    getSentimentStatistics() {
        return axiosClient.get("/admin/dashboard/sentiment");
    },
    getTopProductsBySentiment(sentiment) {
        return axiosClient.get(`/admin/dashboard/top-products-by-sentiment?sentiment=${sentiment}`);
    },
    // ================= PRODUCTS (FOODS) =================

    getProducts() {
        return axiosClient.get("/admin/foods");
    },

    getProductById(id) {
        return axiosClient.get(`/admin/foods/${id}`);
    },

    createProduct(formData) {
        return axiosClient.post("/admin/foods", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
    },

    updateProduct(id, formData) {
        return axiosClient.put(`/admin/foods/${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
    },

    deleteProduct(id) {
        return axiosClient.delete(`/admin/foods/${id}`);
    },

    getCategories() {
        return axiosClient.get("/categories");
    },
    // ================= ORDERS =================
    getOrders() {
        return axiosClient.get("/admin/orders");
    },

    getOrderById(id) {
        return axiosClient.get(`/admin/orders/${id}`);
    },

    updateOrderStatus(id, status) {
        return axiosClient.put(`/admin/orders/${id}/status`, { status });
    },

    // ================= USERS =================
    getUsers() {
        return axiosClient.get("/admin/users");
    },

    getUserById(id) {
        return axiosClient.get(`/admin/users/${id}`);
    },
    // ================= CATEGORIES =================
    getCategories() {
        return axiosClient.get("/admin/categories");
    },
    getCategories() {
        return axiosClient.get("/admin/categories/all");
    },

    getCategoryById(id) {
        return axiosClient.get(`/admin/categories/${id}`);
    },

    createCategory(data) {
        return axiosClient.post(
            "/admin/categories",
            data,
            {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            }
        );
    },

    updateCategory(id, data) {
        return axiosClient.put(
            `/admin/categories/${id}`,
            data,
            {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            }
        );
    },

    deleteCategory(id) {
        return axiosClient.delete(`/admin/categories/${id}`);
    },
    // ================= REVIEWS =================
    getReviews() {
        return axiosClient.get("/admin/reviews");
    },

    getReviewById(id) {
        return axiosClient.get(`/admin/reviews/${id}`);
    },

    toggleReviewVisibility(id, isHidden) {
        return axiosClient.patch(`/admin/reviews/${id}/hide`, { isHidden });
    },

    deleteReview(id) {
        return axiosClient.delete(`/admin/reviews/${id}`);
    },
    // ================= USERS =================
    getUsers() {
        return axiosClient.get("/admin/users");
    },

    getUserById(id) {
        return axiosClient.get(`/admin/users/${id}`);
    },

    createUser(data) {
        return axiosClient.post("/admin/users", data);
    },

    updateUser(id, data) {
        return axiosClient.put(`/admin/users/${id}`, data);
    },

    deleteUser(id) {
        return axiosClient.delete(`/admin/users/${id}`);
    },
    // ================= VOUCHERS =================
    getVouchers() {
        return axiosClient.get("/admin/vouchers");
    },

    getVoucherById(id) {
        return axiosClient.get(`/admin/vouchers/${id}`);
    },

    createVoucher(data) {
        return axiosClient.post("/admin/vouchers", data);
    },

    updateVoucher(id, data) {
        return axiosClient.put(`/admin/vouchers/${id}`, data);
    },

    deleteVoucher(id) {
        return axiosClient.delete(`/admin/vouchers/${id}`);
    },

    toggleVoucherStatus(id, status) {
        return axiosClient.patch(`/admin/vouchers/${id}/status`, { status });
    },
};

export default adminApi;
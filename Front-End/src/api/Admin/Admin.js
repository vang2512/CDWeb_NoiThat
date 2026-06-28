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
    }
};

export default adminApi;
import axiosClient from "../axiosClient";

const adminApi = {

    getDashboardStats() {
        return axiosClient.get("/admin/dashboard/stats");
    },

    getRevenueByMonth(year) {
        return axiosClient.get(`/admin/dashboard/revenue-by-month?year=${year}`);
    },

    getRevenueByCategory(year) {
        return axiosClient.get(
            `/admin/dashboard/revenue-by-category?year=${year}`
        );
    },

    getTopSellingProducts(year) {
        return axiosClient.get(
            `/admin/dashboard/top-selling-products?year=${year}`
        );
    },

    getCategoryStatistics() {
        return axiosClient.get(
            "/admin/dashboard/category-statistics"
        );
    },

    getRecentOrders() {
        return axiosClient.get("/admin/dashboard/recent-orders");
    }

};

export default adminApi;
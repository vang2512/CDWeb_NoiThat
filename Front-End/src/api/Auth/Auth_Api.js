import axiosClient from "../axiosClient";

const authApi = {
  sendOtp: (email) =>
    axiosClient.post(`/users/send-otp?email=${email}`),
  sendOtpRes: (email) =>
    axiosClient.post(`/users/send-otp-res?email=${email}`),
  verifyOtp: (email, otp) =>
    axiosClient.post(`/users/verify-otp`, { email, otp }),

  register: (data) =>
    axiosClient.post(`/users/register`, data),
  login: (data) =>
    axiosClient.post(`/users/login`, data),
  getUser: (id) => axiosClient.get(`/users/${id}`),
  updateUser: (id, data) =>
    axiosClient.put(`/users/update/${id}`, data),
  getAll: () => axiosClient.get("/categories"),
  checkEmail: (email) =>
    axiosClient.get(`/users/check-email?email=${email}`),

  resetPassword: (data) =>
    axiosClient.post(`/users/reset-password`, data),

  //home
  getAll: () => axiosClient.get("/categories"),
  flashSale: () => axiosClient.get("/foods/flash-sale"),
  topselling: () => axiosClient.get("/foods/top-selling"),
  getDetail: (id) => axiosClient.get(`/foods/${id}`),
  getByCategory: (id) => axiosClient.get(`/foods/byCategory/${id}`),
  getReviewsByProduct: (id) => axiosClient.get(`/reviews/product/${id}`),
  addReview: (data) => axiosClient.post(`/reviews/add-review`, data),
  getHistoryOrderUser: (id) => axiosClient.get(`/orders/history/${id}`),
  // authApi.ts
  getDetailOrder: (orderId) => axiosClient.get(`/orders/detail/${orderId}`),
  cancelOrder: (orderId, userId) => axiosClient.put(`/orders/cancel/${orderId}?userId=${userId}`),
  socialLogin: (data) => axiosClient.post('/users/social-login', data),
  searchProduct: (keyword) =>
    axiosClient.get(`/foods/search`, {
      params: { name: keyword }
    }),

  getAvailable: () => axiosClient.get("/vouchers/available"),
  checkNewUser: (userId) =>
    axiosClient.get(`/orders/check-new-user/${userId}`),


  createOrder: (data) =>
    axiosClient.post("/orders/create", data),

  createVNPay: (orderId, amount) =>
    axiosClient.post("/payment/create-vnpay", null, {
      params: { orderId, amount }
    }),

  createMomo: (orderId, amount) =>
    axiosClient.post("/payment/create-momo", null, {
      params: { orderId, amount }
    }),

  // Chat
  chatbot: (message, userId) =>
    axiosClient.post("/chatbot/message", {
      message,
      userId
    }),

  // Gợi ý sp
  getRecommendedFoods: (userId, limit = 8) =>
  axiosClient.get(`/foods/recommended`, {
    params: { userId, limit }
  }),

  searchImage: (file) => {
    const formData = new FormData();
    formData.append("file", file);

    return axiosClient.post("/ai/search-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

};

export default authApi;
import axiosClient from './axiosClient';

const orderService = {
  // Lấy toàn bộ đơn hàng (Admin)
  getAllOrders: async () => {
    const response = await axiosClient.get('/orders'); // axiosClient đã có tiền tố /api
    return response.data;
  },

  // Lấy đơn hàng cá nhân
  getMyOrders: async () => {
    const response = await axiosClient.get('/orders/my-orders');
    return response.data;
  },

  getById: async (orderId) => {
    const response = await axiosClient.get(`/orders/${orderId}`);
    return response.data;
  },

  // Cập nhật trạng thái
  updateStatus: async (orderId, status) => {
    const response = await axiosClient.put(`/orders/status/${orderId}`, { status });
    return response.data;
  },

  // Đặt hàng trực tiếp (Mua ngay)
  checkoutDirectly: async (orderData) => {
    const response = await axiosClient.post('/orders/checkout-direct', orderData);
    return response.data;
  },

  // Đặt hàng từ giỏ hàng
  checkoutCart: async ({ shippingAddress, paymentMethod }) => {
    const response = await axiosClient.post('/orders/checkout-cart', {
      shipping_address: shippingAddress,
      payment_method: paymentMethod,
    });
    return response.data;
  }
};

export default orderService;

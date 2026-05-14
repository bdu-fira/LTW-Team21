import axiosClient from './axiosClient';

const productService = {
  // 1. Lấy tất cả sản phẩm
  getAll: async () => {
    try {
      const res = await axiosClient.get('/products');
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  // 2. Lấy chi tiết 1 sản phẩm
  getById: async (id) => {
    try {
      const res = await axiosClient.get(`/products/${id}`);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  // 3. Thêm sản phẩm mới (Tự động nhận diện FormData qua axiosClient)
  add: async (productData) => {
    try {
      // Không cần config.headers ở đây nữa vì interceptor đã lo
      const res = await axiosClient.post('/products/add', productData);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  // 4. Cập nhật sản phẩm
  update: async (id, productData) => {
    try {
      const res = await axiosClient.put(`/products/${id}`, productData);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  // 5. Xóa sản phẩm
  delete: async (id) => {
    try {
      const res = await axiosClient.delete(`/products/${id}`);
      return res.data;
    } catch (error) {
      throw error;
    }
  }
};

export default productService;
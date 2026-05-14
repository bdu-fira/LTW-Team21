import axios from 'axios';

// Khởi tạo instance của axios
const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000/api', // URL gốc của Backend theo đặc tả
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor cho Request: Tự động đính kèm Token vào Header trước khi gửi
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Định dạng Bearer <TOKEN> theo đúng mục 6 của đặc tả Backend
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor cho Response: Xử lý tập trung các mã lỗi trả về
axiosInstance.interceptors.response.use(
  (response) => response.data, // Trả về trực tiếp dữ liệu để Service sử dụng gọn hơn
  (error) => {
    if (error.response) {
      const { status } = error.response;
      
      // Xử lý mã lỗi 401: Unauthorized (Token hết hạn hoặc không hợp lệ)
      if (status === 401) {
        console.error("Phiên đăng nhập hết hạn.");
        localStorage.clear();
        window.location.href = '/login';
      }
      
      // Xử lý mã lỗi 403: Forbidden (Không đủ quyền Admin/Employee)
      if (status === 403) {
        console.error("Bạn không có quyền thực hiện thao tác này.");
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
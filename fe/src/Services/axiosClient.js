import axios from 'axios';
import { message } from 'antd';

const clearSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.dispatchEvent(new Event('storage'));
};

const axiosClient = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 30000,
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    } else {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        clearSession();

        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
      } else if (status === 403) {
        message.error(data?.message || 'Bạn không có quyền thực hiện thao tác này.');
      }
    } else if (error.request) {
      console.error('Không thể kết nối tới server.');
    }

    return Promise.reject(error);
  }
);

export default axiosClient;

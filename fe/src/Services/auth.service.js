import axiosClient from './axiosClient';

const getErrorMessage = (error, fallbackMessage) =>
  error?.response?.data?.message || error?.message || fallbackMessage;

const authService = {
  login: async (email, password) => {
    try {
      const response = await axiosClient.post('/auth/login', { email, password });
      const data = response.data;

      if (data?.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Dang nhap that bai'));
    }
  },

  register: async (name, email, password) => {
    try {
      const response = await axiosClient.post('/auth/register', { name, email, password });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Dang ky that bai'));
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');

    if (!userStr) {
      return null;
    }

    try {
      return JSON.parse(userStr);
    } catch (error) {
      localStorage.removeItem('user');
      return null;
    }
  },

  getPermissions: async () => {
    try {
      const response = await axiosClient.get('/users/permissions');
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Khong the lay danh sach quyen'));
    }
  },

  hasPermission: async (permission) => {
    try {
      const data = await authService.getPermissions();
      return Array.isArray(data.permissions) && data.permissions.includes(permission);
    } catch (error) {
      return false;
    }
  },

  refreshUserToken: async () => {
    try {
      const response = await axiosClient.post('/auth/refresh');
      const data = response.data;

      if (data?.success && data?.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return true;
      }

      return false;
    } catch (error) {
      return false;
    }
  },
};

export default authService;

import axiosClient from './axiosClient';

const employeeService = {
  getAllUsers: async () => {
    const response = await axiosClient.get('/users');
    return response.data;
  },

  getEmployees: async () => {
    const response = await axiosClient.get('/users/employees');
    return response.data;
  },

  getAllEmployees: async () => {
    const response = await axiosClient.get('/users/employees');
    return response.data;
  },

  updateRole: async (userId, roleId) => {
    const response = await axiosClient.put(`/users/${userId}/role`, { role_id: roleId });
    return response.data;
  },
};

export default employeeService;

import axiosClient from './axiosClient';

const roleService = {
  getRoles: async () => {
    const response = await axiosClient.get('/roles');
    return response.data;
  },

  getAllPermissions: async () => {
    const response = await axiosClient.get('/roles/permissions');
    return response.data;
  },

  getRolePermissions: async (roleId) => {
    const response = await axiosClient.get(`/roles/${roleId}/permissions`);
    return response.data;
  },

  updateRolePermissions: async (roleId, permissionIds) => {
    const response = await axiosClient.post(`/roles/${roleId}/permissions`, { permissionIds });
    return response.data;
  },
};

export default roleService;

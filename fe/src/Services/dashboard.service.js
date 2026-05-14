import axiosClient from './axiosClient';

const dashboardService = {
  getSummary: async () => {
    const response = await axiosClient.get('/dashboard/summary');
    return response.data;
  },

  getRevenueByMonth: async (year = new Date().getFullYear()) => {
    const response = await axiosClient.get('/dashboard/revenue-by-month', {
      params: { year },
    });
    return response.data;
  },

  getTopProducts: async (limit = 5) => {
    const response = await axiosClient.get('/dashboard/top-products', {
      params: { limit },
    });
    return response.data;
  },
};

export default dashboardService;

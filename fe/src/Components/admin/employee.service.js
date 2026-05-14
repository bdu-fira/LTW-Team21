import axiosClient from './axiosClient';

const employeeService = {
    // Lấy danh sách nhân viên/người dùng từ API backend
    getAll: () => {
        return axiosClient.get('/users')
            .then(res => res.data)
            .catch(err => { throw err; });
    },
    
    // Bạn có thể thêm các hàm add, update, delete nhân viên tại đây
};

export default employeeService;
import axiosClient from './axiosClient';

// Lấy danh sách sản phẩm trong giỏ
const getCart = async () => {
    const res = await axiosClient.get('/cart');
    return res.data;
};

// Thêm sản phẩm vào giỏ
const addItem = async (product_id, quantity = 1) => {
    const res = await axiosClient.post('/cart/add', { product_id, quantity });
    return res.data;
};

// Cập nhật số lượng (+ / -)
const updateQuantity = async (product_id, quantity) => {
    const res = await axiosClient.put('/cart/update', { product_id, quantity });
    return res.data;
};

// Xóa sản phẩm khỏi giỏ
const removeItem = async (product_id) => {
    const res = await axiosClient.delete(`/cart/remove/${product_id}`);
    return res.data;
};

// Lưu ý: Hàm checkoutCart đã được chuyển sang order.service.js để tránh trùng lặp và phân tách trách nhiệm rõ ràng hơn.
// Nếu bạn vẫn muốn giữ ở đây, hãy đảm bảo nó gọi đến order.service.checkoutCart hoặc có logic riêng biệt.

const cartService = {
    getCart,
    addItem,
    updateQuantity,
    removeItem,
};

export default cartService;
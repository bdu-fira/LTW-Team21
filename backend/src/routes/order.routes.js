const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
// Đảm bảo bạn import đúng tên middleware bạn đang có
const verifyToken = require('../middleware/auth.middleware'); 
const { authorizeRole } = require('../middleware/role.middleware');

// --- ROUTES CHO USER ---
// Đặt hàng trực tiếp từ trang chi tiết sản phẩm
router.post('/checkout-direct', verifyToken, orderController.checkoutDirect);

// Đặt hàng từ giỏ hàng
router.post('/checkout-cart', verifyToken, orderController.checkoutCart);

// Xem danh sách đơn hàng của tôi
router.get('/my-orders', verifyToken, orderController.getMyOrders);

// --- ROUTES CHO ADMIN/EMPLOYEE ---
// Lấy toàn bộ đơn hàng
router.get('/', verifyToken, authorizeRole('Admin', 'Employee'), orderController.getAllOrders);

// Cập nhật trạng thái đơn hàng
router.put('/status/:id', verifyToken, authorizeRole('Admin', 'Employee'), orderController.updateOrderStatus);

// Lấy chi tiết 1 đơn hàng (Đặt cuối cùng để không bị đè các route trên)
router.get('/:id', verifyToken, orderController.getOrderById);

module.exports = router;
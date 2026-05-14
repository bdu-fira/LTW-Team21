const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const verifyToken = require('../middleware/auth.middleware');

// Lấy danh sách sản phẩm trong giỏ
router.get('/', verifyToken, cartController.getCart);

// Thêm sản phẩm vào giỏ
router.post('/add', verifyToken, cartController.addItem);

// Cập nhật số lượng
router.put('/update', verifyToken, cartController.updateQuantity);

// Xóa sản phẩm khỏi giỏ (Khớp với đường dẫn trong cart.service.js)
router.delete('/remove/:product_id', verifyToken, cartController.removeItem);

module.exports = router;
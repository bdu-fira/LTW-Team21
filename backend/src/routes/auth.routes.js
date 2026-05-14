const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const verifyToken = require('../middleware/auth.middleware'); // Đã sửa
// Khi login thành công, JWT phải chứa role:
/* 
LƯU Ý: Quy trình thực hiện bên trong authController.login:
1. Xác thực user/password.
2. Query DB lấy permissions: SELECT p.permission_name FROM permissions p ... WHERE ur.user_id = ?
const token = jwt.sign({
  id: user.id,
  role: user.role,
  permissions: permissionsArray // Mảng các string quyền từ DB
}, process.env.JWT_SECRET);
*/

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', verifyToken, authController.refreshToken); // Đã sửa

module.exports = router;
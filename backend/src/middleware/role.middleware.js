const jwt = require('jsonwebtoken');

const authorizeRole = (...allowedRoles) => { // Đã sửa tên hàm và cách nhận tham số
  return (req, res, next) => {
    // Kiểm tra req.user (được tạo ra từ middleware authenticate trước đó)
    // Hỗ trợ cả trường hợp payload token lưu là 'role' hoặc 'role_name'
    const userRole = req.user?.role_name || req.user?.role;

    if (!req.user || !allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Bạn không có quyền truy cập tài nguyên này' 
      });
    }
    next();
  };
};

const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    try {
      if (!req.user || !req.user.permissions) {
        return res.status(401).json({ success: false, message: 'Thiếu thông tin quyền hạn' });
      }

      if (!req.user.permissions.includes(requiredPermission)) {
        return res.status(403).json({ 
          success: false, 
          message: 'Bạn không có quyền thực hiện hành động này' 
        });
      }
      next();
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi hệ thống khi kiểm tra quyền' });
    }
  };
};

module.exports = { authorizeRole, checkPermission }; // Đã sửa export
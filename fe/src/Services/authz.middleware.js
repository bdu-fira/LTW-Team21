const jwt = require('jsonwebtoken');
const db = require('../config/db'); // Assuming db is correctly configured for promise-based queries
require('dotenv').config();

// Middleware để xác thực token JWT
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token không tồn tại hoặc không được cung cấp'
      });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        // Handle specific JWT errors
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({
            success: false,
            message: 'Token đã hết hạn'
          });
        }
        if (err.name === 'JsonWebTokenError') {
          return res.status(403).json({
            success: false,
            message: 'Token không hợp lệ'
          });
        }
        return res.status(403).json({
          success: false,
          message: 'Token không hợp lệ hoặc đã hết hạn'
        });
      }

      req.user = decoded; // Lưu thông tin user từ token vào req.user (bao gồm id, role)
      next();
    });
  } catch (error) {
    console.error('Lỗi xác thực token:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server trong quá trình xác thực'
    });
  }
};

// Middleware để kiểm tra vai trò người dùng
const authorizeRoles = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: 'Thông tin vai trò người dùng không có trong token'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập tài nguyên này'
      });
    }
    next();
  };
};

// Middleware để kiểm tra quyền cụ thể của người dùng lấy từ Token payload
const authorizePermissions = (requiredPermission) => {
  return (req, res, next) => {
    try {
      if (!req.user || !req.user.permissions) {
        return res.status(401).json({
          success: false,
          message: 'Chưa xác thực hoặc không tìm thấy danh sách quyền'
        });
      }

      if (!req.user.permissions.includes(requiredPermission)) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền thực hiện hành động này'
        });
      }

      next();
    } catch (error) {
      console.error('Lỗi khi kiểm tra quyền từ token:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi kiểm tra quyền',
        error: error.message
      });
    }
  };
};

module.exports = {
  authenticate,
  authorizeRoles,
  authorizePermissions
};
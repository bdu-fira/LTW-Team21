const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token không tồn tại' 
      });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_key_123', (err, decoded) => {
      if (err) {
        return res.status(403).json({ 
          success: false, 
          message: 'Token không hợp lệ hoặc đã hết hạn' 
        });
      }
      
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error('Lỗi xác thực token:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Lỗi xác thực' 
    });
  }
};

// Xuất trực tiếp hàm để khi require sẽ nhận được một function (đã sửa)
module.exports = authenticate;
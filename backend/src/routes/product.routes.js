const express = require('express');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const productController = require('../controllers/product.controller');
const verifyToken = require('../middleware/auth.middleware');
const { authorizeRole } = require('../middleware/role.middleware');

const router = express.Router();

// Đường dẫn lưu ảnh thực tế trên server
const uploadDir = path.join(__dirname, '../../public/Ảnh Điện Thoại');

// Tạo thư mục nếu chưa có
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình Multer để lưu file
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const baseName = path
            .basename(file.originalname, ext)
            .replace(/\s+/g, '-') // Đổi khoảng trắng thành dấu gạch ngang
            .replace(/[^a-zA-Z0-9-_]/g, ''); // Loại bỏ ký tự đặc biệt

        cb(null, `${Date.now()}-${baseName}${ext}`);
    },
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Chỉ được tải lên file ảnh!'), false);
        }
        cb(null, true);
    },
});

// ROUTES KHAI BÁO
// Công khai (Không cần token)
router.get('/', productController.getAllPhones);
router.get('/search', productController.searchProducts);
router.get('/:id', productController.getPhoneById);

// Bảo mật (Cần Token và Quyền Admin/Employee)
router.post(
    '/add',
    verifyToken,
    authorizeRole('Admin', 'Employee'),
    upload.single('image'), // Nhận file từ trường 'image' trong FormData
    productController.addProduct
);

router.put(
    '/:id',
    verifyToken,
    authorizeRole('Admin', 'Employee'),
    upload.single('image'),
    productController.updateProduct
);

router.delete(
    '/:id',
    verifyToken,
    authorizeRole('Admin', 'Employee'),
    productController.deleteProduct
);

module.exports = router;
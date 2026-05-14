const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const cartRoutes = require('./routes/cart.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const userRoutes = require('./routes/user.routes');
const categoryRoutes = require('./routes/category.routes');
const roleRoutes = require('./routes/role.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const imageDirectoryName = 'images';
const uploadDir = path.join(__dirname, '../public', imageDirectoryName);
const paymentQrDir = path.join(__dirname, '../public', 'Ảnh Điện Thoại');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use(`/${encodeURI(imageDirectoryName)}`, express.static(uploadDir));
app.use('/images', express.static(uploadDir));
app.use('/payment-qr', express.static(paymentQrDir));

app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/roles', roleRoutes);

app.use((err, req, res, next) => {
  console.error('Loi server:', err);
  res.status(500).json({
    success: false,
    message: 'Loi server',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Loi noi bo',
  });
});

app.listen(PORT, () => {
  console.log('-------------------------------------------');
  console.log(`Server dang chay tai: http://localhost:${PORT}`);
  console.log(`Thu muc anh san pham: ${uploadDir}`);
  console.log(`Thu muc QR thanh toan: ${paymentQrDir}`);
  console.log(`Link anh san pham: http://localhost:${PORT}/images/ten-anh.jpg`);
  console.log(`Link QR thanh toan: http://localhost:${PORT}/payment-qr/maqr.jpg`);
  console.log('-------------------------------------------');
});

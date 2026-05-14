const mysql = require('mysql2/promise'); // Bắt buộc phải có /promise
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS, // Đã sửa từ DB_PASSWORD thành DB_PASS cho khớp với .env
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Xuất pool ra để dùng trực tiếp với async/await
module.exports = pool;
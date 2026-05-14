const express = require('express');
const db = require('../config/db');
const verifyToken = require('../middleware/auth.middleware');
const { authorizeRole } = require('../middleware/role.middleware');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM categories ORDER BY name');
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/add', verifyToken, authorizeRole('Admin', 'Employee'), async (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ success: false, message: 'name is required' });
    }

    try {
        await db.query('INSERT INTO categories (name) VALUES (?)', [name]);
        res.json({ success: true, message: 'Them danh muc thanh cong' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;

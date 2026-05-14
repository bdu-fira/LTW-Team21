const express = require('express');
const db = require('../config/db');
const verifyToken = require('../middleware/auth.middleware');
const { authorizeRole } = require('../middleware/role.middleware');

const router = express.Router();

router.get('/', verifyToken, authorizeRole('Admin', 'Employee'), async (req, res) => {
    try {
        const [rows] = await db.query(
            `
                SELECT u.id, u.name, u.email, u.created_at, r.name_role AS role, r.id AS role_id
                FROM users u
                JOIN user_roles ur ON u.id = ur.user_id
                JOIN roles r ON ur.role_id = r.id
                ORDER BY u.created_at DESC
            `
        );

        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/employees', verifyToken, authorizeRole('Admin', 'Employee'), async (req, res) => {
    try {
        const [rows] = await db.query(
            `
                SELECT u.id, u.name, u.email, u.created_at, r.name_role AS role, r.id AS role_id
                FROM users u
                JOIN user_roles ur ON u.id = ur.user_id
                JOIN roles r ON ur.role_id = r.id
                WHERE r.name_role IN ('Admin', 'Employee')
                ORDER BY u.created_at DESC
            `
        );

        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/permissions', verifyToken, async (req, res) => {
    try {
        const [rows] = await db.query(
            `
                SELECT DISTINCT p.permission_name
                FROM permissions p
                JOIN role_permissions rp ON p.id = rp.permission_id
                JOIN user_roles ur ON rp.role_id = ur.role_id
                WHERE ur.user_id = ?
                ORDER BY p.permission_name
            `,
            [req.user.id]
        );

        res.json({
            success: true,
            permissions: rows.map((row) => row.permission_name),
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/:id/role', verifyToken, authorizeRole('Admin'), async (req, res) => {
    const { role_id } = req.body;
    const { id } = req.params;

    if (!role_id) {
        return res.status(400).json({ success: false, message: 'role_id is required' });
    }

    try {
        const [result] = await db.query(
            'UPDATE user_roles SET role_id = ? WHERE user_id = ?',
            [role_id, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'User role not found' });
        }

        res.json({ success: true, message: 'Cap nhat quyen thanh cong' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;

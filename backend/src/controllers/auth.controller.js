const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const buildFallbackName = (email = '') => {
    const normalizedEmail = String(email || '').trim();

    if (!normalizedEmail) {
        return 'Customer';
    }

    return normalizedEmail.split('@')[0] || normalizedEmail;
};

exports.register = async (req, res) => {
    try {
        let { name, email, password } = req.body;

        if (typeof email === 'object' && email.email) {
            name = email.name;
            password = email.password;
            email = email.email;
        }

        const normalizedName = String(name || '').trim() || buildFallbackName(email);
        const normalizedEmail = String(email || '').trim().toLowerCase();
        const normalizedPassword = String(password || '');

        if (!normalizedEmail || !normalizedPassword) {
            return res.status(400).json({
                success: false,
                message: 'Vui long nhap day du email va mat khau!',
            });
        }

        const [existingUsers] = await db.query(
            'SELECT id FROM users WHERE email = ?',
            [normalizedEmail]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Email nay da duoc dang ky!',
            });
        }

        const hashedPassword = await bcrypt.hash(normalizedPassword, 10);

        const [userResult] = await db.query(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [normalizedName, normalizedEmail, hashedPassword]
        );

        await db.query(
            'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
            [userResult.insertId, 3]
        );

        return res.status(201).json({
            success: true,
            message: 'Dang ky thanh cong!',
            user: {
                id: userResult.insertId,
                name: normalizedName,
                email: normalizedEmail,
                role: 'Customer',
            },
        });
    } catch (error) {
        console.error('Loi dang ky:', error);
        return res.status(500).json({
            success: false,
            message: 'Loi he thong!',
            error: error.message,
        });
    }
};

exports.login = async (req, res) => {
    try {
        let { email, password } = req.body;

        if (typeof email === 'object' && email.email) {
            password = email.password;
            email = email.email;
        }

        const normalizedEmail = String(email || '').trim().toLowerCase();
        const normalizedPassword = String(password || '');

        if (!normalizedEmail || !normalizedPassword) {
            return res.status(400).json({
                success: false,
                message: 'Vui long nhap email va mat khau!',
            });
        }

        const loginSql = `
            SELECT u.id, u.email, u.password, u.name, r.name_role
            FROM users u
            LEFT JOIN user_roles ur ON u.id = ur.user_id
            LEFT JOIN roles r ON ur.role_id = r.id
            WHERE u.email = ?
        `;

        const [users] = await db.query(loginSql, [normalizedEmail]);

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Tai khoan khong ton tai!',
            });
        }

        const user = users[0];
        let isPasswordValid = false;
        let needsUpgrade = false;

        const isBcrypt = user.password.startsWith('$2') && user.password.length > 30;

        if (isBcrypt) {
            isPasswordValid = await bcrypt.compare(normalizedPassword, user.password);
        } else if (normalizedPassword === String(user.password || '')) {
            isPasswordValid = true;
            needsUpgrade = true;
        }

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Mat khau khong chinh xac!',
            });
        }

        if (needsUpgrade) {
            const newHashedPassword = await bcrypt.hash(normalizedPassword, 10);
            await db.query('UPDATE users SET password = ? WHERE id = ?', [newHashedPassword, user.id]);
            console.log(`---> Da nang cap bao mat cho user: ${user.email}`);
        }

        const userRole = user.name_role || 'Customer';

        const token = jwt.sign(
            { id: user.id, email: user.email, role: userRole },
            process.env.JWT_SECRET || 'your_secret_key',
            { expiresIn: '24h' }
        );

        return res.status(200).json({
            success: true,
            message: 'Dang nhap thanh cong!',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: userRole,
            },
        });
    } catch (error) {
        console.error('Loi dang nhap:', error);
        return res.status(500).json({
            success: false,
            message: 'Loi may chu!',
        });
    }
};

exports.refreshToken = async (req, res) => {
    try {
        const userId = req.user.id;

        const [users] = await db.query(`
            SELECT u.id, u.email, u.name, r.name_role
            FROM users u
            JOIN user_roles ur ON u.id = ur.user_id
            JOIN roles r ON ur.role_id = r.id
            WHERE u.id = ?
        `, [userId]);

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User khong ton tai',
            });
        }

        const user = users[0];

        const [permissionRows] = await db.query(`
            SELECT DISTINCT p.permission_name
            FROM permissions p
            JOIN role_permissions rp ON p.id = rp.permission_id
            JOIN user_roles ur ON rp.role_id = ur.role_id
            WHERE ur.user_id = ?
        `, [userId]);

        const permissions = permissionRows.map((row) => row.permission_name);

        const newToken = jwt.sign(
            { id: user.id, email: user.email, role: user.name_role, permissions },
            process.env.JWT_SECRET || 'your_secret_key',
            { expiresIn: '24h' }
        );

        return res.status(200).json({
            success: true,
            token: newToken,
            user: { ...user, role: user.name_role },
        });
    } catch (error) {
        console.error('Refresh Token Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Loi lam moi token',
        });
    }
};

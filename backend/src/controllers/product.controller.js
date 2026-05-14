const fs = require('fs');
const path = require('path');
const db = require('../config/db');

const IMAGE_DIR = path.join(__dirname, '../../public/Ảnh Điện Thoại');

const deleteOldImage = (imageName) => {
    if (!imageName || imageName.includes('/') || imageName.includes('\\')) {
        return;
    }

    const imagePath = path.join(IMAGE_DIR, imageName);

    if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
    }
};

exports.getAllPhones = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM products ORDER BY created_at DESC');
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.searchProducts = async (req, res) => {
    const { name } = req.query;

    try {
        const [rows] = await db.query(
            'SELECT * FROM products WHERE name LIKE ? ORDER BY created_at DESC',
            [`%${name || ''}%`]
        );

        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getPhoneById = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'San pham khong ton tai' });
        }

        res.json({ success: true, data: rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.addProduct = async (req, res) => {
    const { name, price, stock, description, category_id } = req.body;
    const image = req.file?.filename || null;

    if (!name || !price) {
        return res.status(400).json({ success: false, message: 'Ten va gia la bat buoc' });
    }

    try {
        const [result] = await db.query(
            `
                INSERT INTO products (name, price, stock, image, description, category_id)
                VALUES (?, ?, ?, ?, ?, ?)
            `,
            [name, price, stock || 0, image, description || '', category_id || null]
        );

        res.json({
            success: true,
            message: 'Them san pham thanh cong',
            productId: result.insertId,
            image,
        });
    } catch (error) {
        if (image) {
            deleteOldImage(image);
        }

        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    const { name, price, stock, description, category_id, currentImage } = req.body;
    const { id } = req.params;

    if (!name || !price) {
        return res.status(400).json({ success: false, message: 'Ten va gia la bat buoc' });
    }

    try {
        const [existingRows] = await db.query('SELECT * FROM products WHERE id = ?', [id]);

        if (existingRows.length === 0) {
            if (req.file?.filename) {
                deleteOldImage(req.file.filename);
            }

            return res.status(404).json({ success: false, message: 'San pham khong ton tai' });
        }

        const existingProduct = existingRows[0];
        let finalImage = currentImage || existingProduct.image || null;

        if (req.file?.filename) {
            finalImage = req.file.filename;

            if (existingProduct.image && existingProduct.image !== finalImage) {
                deleteOldImage(existingProduct.image);
            }
        }

        await db.query(
            `
                UPDATE products
                SET name = ?, price = ?, stock = ?, image = ?, description = ?, category_id = ?
                WHERE id = ?
            `,
            [
                name,
                price,
                stock || 0,
                finalImage,
                description || '',
                category_id || null,
                id,
            ]
        );

        res.json({
            success: true,
            message: 'Cap nhat thong tin thanh cong',
            image: finalImage,
        });
    } catch (error) {
        if (req.file?.filename) {
            deleteOldImage(req.file.filename);
        }

        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    const { id } = req.params;

    try {
        const [existingRows] = await db.query('SELECT id, image FROM products WHERE id = ?', [id]);

        if (existingRows.length === 0) {
            return res.status(404).json({ success: false, message: 'San pham khong ton tai' });
        }

        await db.query('DELETE FROM products WHERE id = ?', [id]);

        if (existingRows[0].image) {
            deleteOldImage(existingRows[0].image);
        }

        res.json({ success: true, message: 'Da xoa san pham khoi he thong' });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Khong the xoa san pham (co the dang ton tai trong don hang)',
        });
    }
};

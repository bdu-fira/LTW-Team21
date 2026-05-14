const db = require('../config/db');

// Lấy tất cả danh mục
exports.getAll = async (req, res) => {
    try {
        const [categories] = await db.query("SELECT * FROM categories ORDER BY created_at DESC");
        res.json({ success: true, data: categories });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Thêm danh mục mới
exports.create = async (req, res) => {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "Tên danh mục là bắt buộc" });

    try {
        const [result] = await db.query(
            "INSERT INTO categories (name, description) VALUES (?, ?)",
            [name, description]
        );
        res.json({ 
            success: true, 
            message: "Thêm danh mục thành công", 
            data: { id: result.insertId, name, description } 
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: "Tên danh mục đã tồn tại" });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

// Cập nhật danh mục
exports.update = async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;

    try {
        const [result] = await db.query(
            "UPDATE categories SET name = ?, description = ? WHERE id = ?",
            [name, description, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy danh mục" });
        }
        res.json({ success: true, message: "Cập nhật danh mục thành công" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Xóa danh mục
exports.delete = async (req, res) => {
    const { id } = req.params;

    try {
        // Lưu ý: Trong thực tế nên kiểm tra xem có sản phẩm nào đang thuộc danh mục này không
        const [result] = await db.query("DELETE FROM categories WHERE id = ?", [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Không tìm thấy danh mục" });
        }
        res.json({ success: true, message: "Xóa danh mục thành công" });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ success: false, message: "Không thể xóa danh mục đang có sản phẩm" });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};
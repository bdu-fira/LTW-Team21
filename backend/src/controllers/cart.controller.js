const db = require('../config/db');

// 1. Thêm hoặc cập nhật số lượng sản phẩm trong giỏ
exports.addItem = async (req, res) => {
    const userId = req.user.id; // Lấy từ verifyToken middleware
    const { product_id, quantity = 1 } = req.body;

    if (!product_id) {
        return res.status(400).json({ success: false, message: "Thiếu product_id" });
    }

    try {
        // Kiểm tra tồn kho trước khi cho phép thêm vào giỏ
        const [product] = await db.query("SELECT stock, name FROM products WHERE id = ?", [product_id]);
        if (product.length === 0) return res.status(404).json({ success: false, message: "Sản phẩm không tồn tại" });

        if (product[0].stock < quantity) {
            return res.status(400).json({ success: false, message: `Sản phẩm ${product[0].name} không đủ hàng!` });
        }

        // Kiểm tra sản phẩm đã có trong giỏ chưa
        const [existing] = await db.query(
            "SELECT * FROM cart WHERE user_id = ? AND product_id = ?",
            [userId, product_id]
        );

        if (existing.length > 0) {
            // Kiểm tra tổng số lượng sau khi cộng thêm có vượt quá kho không
            if (existing[0].quantity + quantity > product[0].stock) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Tổng số lượng trong giỏ vượt quá tồn kho (${product[0].stock})` 
                });
            }
            // Đã có thì cộng dồn số lượng
            await db.query(
                "UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?",
                [quantity, userId, product_id]
            );
        } else {
            // Chưa có thì thêm mới
            await db.query(
                "INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)",
                [userId, product_id, quantity]
            );
        }
        res.json({ success: true, message: "Đã cập nhật giỏ hàng thành công!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Lấy danh sách giỏ hàng (JOIN với bảng products mới)
exports.getCart = async (req, res) => {
    const userId = req.user.id;
    try {
        const sql = `
            SELECT 
                c.id as cart_id, 
                c.product_id, 
                c.quantity, 
                p.name, 
                p.price, 
                p.image,
                p.stock
            FROM cart c 
            JOIN products p ON c.product_id = p.id 
            WHERE c.user_id = ?`;
            
        const [items] = await db.query(sql, [userId]);
        res.json({ success: true, cart: items });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Xóa một sản phẩm khỏi giỏ hàng
exports.removeItem = async (req, res) => {
    const userId = req.user.id;
    const productId = req.params.product_id;

    if (!productId) {
        return res.status(400).json({ success: false, message: "Thiếu ID sản phẩm cần xóa" });
    }

    try {
        const [result] = await db.query(
            "DELETE FROM cart WHERE user_id = ? AND product_id = ?",
            [userId, productId]
        );
        res.json({ success: true, message: "Đã xóa sản phẩm khỏi giỏ hàng", affectedRows: result.affectedRows });
    } catch (error) {
        console.error("Lỗi xóa sản phẩm giỏ hàng:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. Cập nhật số lượng trực tiếp (Dùng khi bấm nút + / - trong giỏ hàng)
exports.updateQuantity = async (req, res) => {
    const userId = req.user.id;
    const { product_id, quantity } = req.body;

    try {
        if (quantity <= 0) {
            // Nếu số lượng về 0 thì xóa luôn sản phẩm
            await db.query("DELETE FROM cart WHERE user_id = ? AND product_id = ?", [userId, product_id]);
        } else {
            // Kiểm tra tồn kho trước khi cập nhật số lượng mới
            const [product] = await db.query("SELECT stock FROM products WHERE id = ?", [product_id]);
            if (product.length > 0 && quantity > product[0].stock) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Kho chỉ còn ${product[0].stock} sản phẩm` 
                });
            }
            await db.query(
                "UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?",
                [quantity, userId, product_id]
            );
        }
        res.json({ success: true, message: "Cập nhật số lượng thành công" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

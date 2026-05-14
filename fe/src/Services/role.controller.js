const db = require('../config/db');

// Lấy tất cả Roles
exports.getAllRoles = async (req, res) => {
    try {
        const [rows] = await db.promise().query("SELECT * FROM roles");
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Lấy tất cả Permissions có trong hệ thống
exports.getAllPermissions = async (req, res) => {
    try {
        const [rows] = await db.promise().query("SELECT * FROM permissions");
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Lấy danh sách ID quyền của một Role cụ thể
exports.getPermissionsByRole = async (req, res) => {
    const { roleId } = req.params;
    try {
        const [rows] = await db.promise().query(
            "SELECT permission_id FROM role_permissions WHERE role_id = ?",
            [roleId]
        );
        const permissionIds = rows.map(r => r.permission_id);
        res.json({ success: true, data: permissionIds });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Cập nhật danh sách quyền cho Role (Bulk Update)
exports.updateRolePermissions = async (req, res) => {
    const { roleId } = req.params;
    const { permissionIds } = req.body; // Mảng các ID quyền mới [1, 2, 5...]

    const connection = await db.promise().getConnection();
    try {
        await connection.beginTransaction();

        // 1. Xóa tất cả quyền cũ của Role này
        await connection.query("DELETE FROM role_permissions WHERE role_id = ?", [roleId]);

        // 2. Thêm các quyền mới được gán
        if (permissionIds && permissionIds.length > 0) {
            const values = permissionIds.map(pId => [roleId, pId]);
            await connection.query(
                "INSERT INTO role_permissions (role_id, permission_id) VALUES ?",
                [values]
            );
        }

        await connection.commit();
        res.json({ success: true, message: "Cập nhật quyền thành công!" });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
};
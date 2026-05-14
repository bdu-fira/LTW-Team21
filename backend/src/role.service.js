const db = require('./config/db');

const getRoles = async () => {
    const [rows] = await db.query('SELECT * FROM roles ORDER BY id');
    return rows;
};

const getAllPermissions = async () => {
    const [rows] = await db.query('SELECT * FROM permissions ORDER BY id');
    return rows;
};

const getRolePermissions = async (roleId) => {
    const [rows] = await db.query(
        'SELECT permission_id FROM role_permissions WHERE role_id = ? ORDER BY permission_id',
        [roleId]
    );

    return rows.map((row) => row.permission_id);
};

const updateRolePermissions = async (roleId, permissionIds = []) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();
        await connection.query('DELETE FROM role_permissions WHERE role_id = ?', [roleId]);

        if (permissionIds.length > 0) {
            const values = permissionIds.map((permissionId) => [roleId, permissionId]);
            await connection.query(
                'INSERT INTO role_permissions (role_id, permission_id) VALUES ?',
                [values]
            );
        }

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

module.exports = {
    getRoles,
    getAllPermissions,
    getRolePermissions,
    updateRolePermissions,
};

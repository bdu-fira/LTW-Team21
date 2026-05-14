const roleService = require('../role.service');

exports.getAllRoles = async (req, res) => {
    try {
        const roles = await roleService.getRoles();
        res.json({ success: true, data: roles });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllPermissions = async (req, res) => {
    try {
        const permissions = await roleService.getAllPermissions();
        res.json({ success: true, data: permissions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getPermissionsByRole = async (req, res) => {
    try {
        const permissionIds = await roleService.getRolePermissions(req.params.roleId);
        res.json({ success: true, data: permissionIds });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateRolePermissions = async (req, res) => {
    try {
        await roleService.updateRolePermissions(req.params.roleId, req.body.permissionIds || []);
        res.json({ success: true, message: 'Cap nhat quyen thanh cong' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

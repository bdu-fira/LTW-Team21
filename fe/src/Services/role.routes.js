const express = require('express');
const router = express.Router();
const roleController = require('../controllers/role.controller');
const { authenticate, authorizeRoles } = require('../middleware/authz.middleware');

// Chỉ Admin mới được quản lý gán quyền
router.use(authenticate, authorizeRoles(['Admin']));

router.get('/', roleController.getAllRoles);
router.get('/permissions', roleController.getAllPermissions);
router.get('/:roleId/permissions', roleController.getPermissionsByRole);
router.post('/:roleId/permissions', roleController.updateRolePermissions);

module.exports = router;
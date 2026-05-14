const express = require('express');
const roleController = require('../controllers/role.controller');
const verifyToken = require('../middleware/auth.middleware');
const { authorizeRole } = require('../middleware/role.middleware');

const router = express.Router();

router.use(verifyToken, authorizeRole('Admin'));

router.get('/', roleController.getAllRoles);
router.get('/permissions', roleController.getAllPermissions);
router.get('/:roleId/permissions', roleController.getPermissionsByRole);
router.post('/:roleId/permissions', roleController.updateRolePermissions);

module.exports = router;

const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const authenticate = require('../middleware/auth.middleware');
const { authorizeRole } = require('../middleware/role.middleware');

router.get('/', categoryController.getAll);
router.post('/add', authenticate, authorizeRole('Admin'), categoryController.create);
router.put('/:id', authenticate, authorizeRole('Admin'), categoryController.update);
router.delete('/:id', authenticate, authorizeRole('Admin'), categoryController.delete);

module.exports = router;
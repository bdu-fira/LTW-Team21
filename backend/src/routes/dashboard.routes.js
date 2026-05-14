const express = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const verifyToken = require('../middleware/auth.middleware');
const { authorizeRole } = require('../middleware/role.middleware');

const router = express.Router();

router.use(verifyToken, authorizeRole('Admin', 'Employee'));

router.get('/summary', dashboardController.getSummary);
router.get('/revenue-by-month', dashboardController.getRevenueByMonth);
router.get('/top-products', dashboardController.getTopProducts);

module.exports = router;

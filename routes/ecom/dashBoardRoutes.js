const express = require('express');
const router = express.Router();
const dashBoardController = require('../../controllers/ecom/dashBoardController');
const ecomAuthMiddleware = require('../../middleware/ecom/auth');

// All dashboard routes require authentication
router.use(ecomAuthMiddleware);

router.get('/stats', dashBoardController.getDashboardStats);
router.get('/analytics', dashBoardController.getSalesAnalytics);

module.exports = router;

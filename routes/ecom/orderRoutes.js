const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/ecom/orderController');
const ecomAuthMiddleware = require('../../middleware/ecom/auth');

// All order routes require authentication
router.use(ecomAuthMiddleware);

router.get('/', orderController.getAllOrders);
router.get('/:id', orderController.getOrderById);
router.post('/', orderController.createOrder);
router.put('/:id/status', orderController.updateOrderStatus);

module.exports = router;

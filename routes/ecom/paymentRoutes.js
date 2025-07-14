const express = require('express');
const router = express.Router();
const paymentController = require('../../controllers/ecom/paymentController');
const ecomAuthMiddleware = require('../../middleware/ecom/auth');

// Public payment routes (no auth required for checkout)
router.get('/config', paymentController.getStripeConfig); // Get Stripe public key
router.post('/create-payment-intent', paymentController.createPaymentIntent);
router.post('/confirm-payment', paymentController.confirmPayment);
router.get('/order-number/:orderNumber', paymentController.getOrderByNumber);

// Admin routes (require authentication)
router.get('/orders', ecomAuthMiddleware, paymentController.getAllOrders);

module.exports = router;

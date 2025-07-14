const express = require('express');
const router = express.Router();
const authController = require('../../controllers/ecom/authController');
const ecomAuthMiddleware = require('../../middleware/ecom/auth');

// Public routes
router.post('/signup', authController.signup);
router.post('/signin', authController.signin);
router.post('/forget-password', authController.forgetPassword);
router.post('/reset-password/:token', authController.resetPassword);

// Protected routes
router.get('/verify-token', ecomAuthMiddleware, authController.verifyToken);

module.exports = router;

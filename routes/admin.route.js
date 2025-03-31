const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.post('/login', adminController.loginAdmin);

// Protected routes - require authentication
router.get('/me', authMiddleware, adminController.getCurrentAdmin);

// Admin management routes - should be protected
router.post('/', authMiddleware, adminController.createAdmin);
router.get('/', authMiddleware, adminController.getAllAdmins);
router.get('/:id', authMiddleware, adminController.getAdmin);
router.patch('/:id', authMiddleware, adminController.updateAdmin);
router.delete('/:id', authMiddleware, adminController.deleteAdmin);
router.patch('/:id/password', authMiddleware, adminController.changePassword);

module.exports = router;
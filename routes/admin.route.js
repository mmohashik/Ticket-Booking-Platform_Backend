const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/login', adminController.loginAdmin);

// Protected routes
router.get('/', protect, adminController.getAllAdmins);
router.post('/', protect, adminController.createAdmin);
router.get('/:id', protect, adminController.getAdmin);
router.get('/users/count', protect, adminController.getTotalUsers);
router.put('/:id', protect, adminController.updateAdmin);
router.delete('/:id', protect, adminController.deleteAdmin);
router.patch('/:id/change-password', protect, adminController.changePassword);

module.exports = router;
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');

// Admin CRUD routes
router.get('/', adminController.getAllAdmins);
router.post('/', adminController.createAdmin);
router.get('/:id', adminController.getAdmin);
router.get('/users/count', adminController.getTotalUsers);
router.put('/:id', adminController.updateAdmin);
router.delete('/:id', adminController.deleteAdmin);
router.patch('/:id/change-password', adminController.changePassword);

module.exports = router;
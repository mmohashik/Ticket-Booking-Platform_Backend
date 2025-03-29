const express = require('express');
const router = express.Router();
//const adminController = require('../controllers/admin.controller');
const { 
    createAdmin, 
    getAllAdmins, 
    getAdmin,
    updateAdmin,
    deleteAdmin,
    changePassword 
  } = require('../controllers/admin.controller');

// Create Admin
router.post('/', createAdmin);

// Get All Admins
router.get('/', getAllAdmins);

// Get Single Admin
router.get('/:id', getAdmin);

// Update Admin
router.patch('/:id', updateAdmin);

// Delete Admin
router.delete('/:id', deleteAdmin);

// Change Password
router.patch('/:id/password', changePassword);

module.exports = router;
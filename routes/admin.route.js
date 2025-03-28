const express = require('express');
const router = express.Router();
const { 
  getAllAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin
} = require('../controllers/admin.controller');
const { check } = require('express-validator');

// GET - Get all admins
router.get('/', getAllAdmins);

// POST - Create new admin
router.post('/', [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password must be at least 6 characters').isLength({ min: 6 })
], createAdmin);

// PATCH - Update admin by ID
router.patch('/:id', [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail()
], updateAdmin);

// DELETE - Delete admin by ID
router.delete('/:id', deleteAdmin);

module.exports = router;
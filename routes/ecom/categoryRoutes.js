const express = require('express');
const router = express.Router();
const categoryController = require('../../controllers/ecom/categoryController');
const ecomAuthMiddleware = require('../../middleware/ecom/auth');

// Public routes
router.get('/', categoryController.getAllCategories);

// Protected routes (require authentication)
router.post('/', ecomAuthMiddleware, categoryController.addCategory);
router.put('/:id', ecomAuthMiddleware, categoryController.updateCategory);
router.delete('/:id', ecomAuthMiddleware, categoryController.deleteCategory);

module.exports = router;

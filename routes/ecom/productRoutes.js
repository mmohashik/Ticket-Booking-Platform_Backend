const express = require('express');
const router = express.Router();
const productController = require('../../controllers/ecom/productController');
const ecomAuthMiddleware = require('../../middleware/ecom/auth');
const ecomUpload = require('../../config/ecom/uploadConfig');

// Public routes
router.get('/', productController.getAllProducts);

// Recycle bin routes (must come before /:id routes)
router.get('/recycled', ecomAuthMiddleware, productController.getRecycledProducts);

// Single product routes
router.get('/:id', productController.getProductById);

// Protected routes (require authentication)
router.post('/', ecomAuthMiddleware, ecomUpload.array('images', 5), productController.addProduct);
router.put('/:id', ecomAuthMiddleware, ecomUpload.array('images', 5), productController.updateProduct);
router.delete('/:id', ecomAuthMiddleware, productController.deleteProduct);

// Restore and permanent delete routes
router.put('/:id/restore', ecomAuthMiddleware, productController.restoreProduct);
router.delete('/:id/permanent', ecomAuthMiddleware, productController.permanentDeleteProduct);

// Stock management routes
router.post('/:id/check-stock', productController.checkStock);
router.put('/:id/reduce-stock', ecomAuthMiddleware, productController.reduceStock);

module.exports = router;

const express = require('express');
const router = express.Router();
const stockController = require('../../controllers/ecom/stockController');
const ecomAuthMiddleware = require('../../middleware/ecom/auth');

// All stock routes require authentication
router.use(ecomAuthMiddleware);

router.get('/', stockController.getAllStock);
router.get('/low-stock', stockController.getLowStock);
router.post('/', stockController.addStock);
router.put('/:id', stockController.updateStock);

module.exports = router;

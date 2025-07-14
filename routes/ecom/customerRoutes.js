const express = require('express');
const router = express.Router();
const customerController = require('../../controllers/ecom/customerController');
const ecomAuthMiddleware = require('../../middleware/ecom/auth');

// All customer routes require authentication
router.use(ecomAuthMiddleware);

router.get('/', customerController.getAllCustomers);
router.post('/', customerController.addCustomer);
router.put('/:id', customerController.updateCustomer);
router.delete('/:id', customerController.deleteCustomer);

module.exports = router;

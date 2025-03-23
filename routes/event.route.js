const express = require('express');
const router = express.Router();
const Event = require('../models/event.model');
const { postEvent } = require('../controllers/event.controller');
const upload = require('../middleware/multer');

router.post('/', upload.single("image"), postEvent);

module.exports = router;
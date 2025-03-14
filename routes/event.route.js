const express = require('express');
const router = express.Router();
const Event = require('../models/event.model');
const { postEvent } = require('../controllers/event.controller');

router.post('/', postEvent);

module.exports = router;
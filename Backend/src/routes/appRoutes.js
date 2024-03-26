const express = require('express');
const router = express.Router();
const appController = require('../controllers/inverterDetail');
const appController1 = require('../controllers/inverterList');



router.post('/api/inverterDetail', appController.getData);
router.post('/api/inverterList', appController1.getData);

module.exports = router;

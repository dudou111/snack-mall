const express = require('express');
const auth = require('../middleware/auth');
const dashboardCtrl = require('../controllers/dashboardCtrl');

const router = express.Router();

router.get('/overview', auth, dashboardCtrl.getDashboardOverview);

module.exports = router;

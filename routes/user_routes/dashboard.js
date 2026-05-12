const express = require('express');
const router = express.Router();
const dashboardHandler = require('../../controllers/user_controllers/dashboardController');
const verifyJWT = require('../../middleware/verifyJWT');

router.get('/', verifyJWT, dashboardHandler.dashboardData);

module.exports = router;
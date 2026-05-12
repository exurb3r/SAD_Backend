const express = require('express');
const router = express.Router();
const gymHistoryController = require('../../controllers/user_controllers/gymstatusController');
const verifyJWT = require('../../middleware/verifyJWT');

router.get('/', verifyJWT, gymHistoryController.getGymHistory);

module.exports = router;
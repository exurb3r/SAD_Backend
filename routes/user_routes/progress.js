const express = require('express');
const router = express.Router();
const progressHandler = require('../../controllers/user_controllers/progressController');
const verifyJWT = require('../../middleware/verifyJWT');

router.get('/:period', verifyJWT, progressHandler.getProgressData);

module.exports = router;

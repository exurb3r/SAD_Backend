const express = require('express');
const router = express.Router();
const authController = require('../../controllers/user_controllers/authController');
const verifyJWT = require('../../middleware/verifyJWT');

router.post('/login', authController.login);
router.post('/signup', authController.signup);
router.post('/logout', authController.logout);
router.get('/me', verifyJWT, authController.me);

module.exports = router;
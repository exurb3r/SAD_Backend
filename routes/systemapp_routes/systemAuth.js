    const express = require('express');
    const router = express.Router();
    const authController = require('../../controllers/systemapp_controllers/authController');

    router.post('/login', authController.login);


    module.exports = router;

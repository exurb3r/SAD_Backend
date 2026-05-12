const express = require('express');
const router = express.Router();

router.use('/auth', require('./systemapp_routes/systemAuth'));
router.use('/members', require('./systemapp_routes/memberlogin'));


module.exports = router;
const express = require('express');
const router = express.Router();
const memberController = require('../../controllers/systemapp_controllers/memberController');
const verifyJWT = require('../../middleware/verifyJWT');

router.get('/', verifyJWT, memberController.getAllMembers);
router.get('/:id', verifyJWT, memberController.getMemberById);

router.post('/rfid', verifyJWT, memberController.rfidScan);  
router.post('/:id/login', verifyJWT, memberController.timeIn);
router.post('/:id/logout', verifyJWT, memberController.timeOut);

module.exports = router;
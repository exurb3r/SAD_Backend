const express = require('express');
const router = express.Router();

const verifyJWT = require('../../middleware/verifyJWT');
const controller = require('../../controllers/user_controllers/notifController');

router.get('/', verifyJWT, controller.getNotifications);

router.post('/friend/accept', verifyJWT, controller.acceptFriendRequest);
router.post('/friend/decline', verifyJWT, controller.declineFriendRequest);

router.post('/invite/accept', verifyJWT, controller.acceptInvitation);
router.post('/invite/decline', verifyJWT, controller.declineInvitation);

module.exports = router;
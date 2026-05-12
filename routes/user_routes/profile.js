const express = require('express');
const router = express.Router();
const verifyJWT = require('../../middleware/verifyJWT');
const profileController = require('../../controllers/user_controllers/profileController');

router.get('/', verifyJWT, profileController.getProfileData);
router.patch('/edit', verifyJWT, profileController.editProfile);
router.post('/invite', verifyJWT, profileController.sendInvite);
router.delete('/unfriend/:friendId', verifyJWT, profileController.unfriend);
router.get('/view/:userId', verifyJWT, profileController.getFriendProfile); // ← add this

module.exports = router;
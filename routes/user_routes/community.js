const express = require('express');
const router = express.Router();
const verifyJWT = require('../../middleware/verifyJWT');
const community = require('../../controllers/user_controllers/communityController');

router.get("/users",verifyJWT,community.getCommunityUsers);
router.get("/announcements",verifyJWT,community.getAnnouncements);

router.post("/addfriend",verifyJWT,community.addFriendRequest);
router.post("/cancelrequest",verifyJWT,community.cancelFriendRequest);

module.exports = router;
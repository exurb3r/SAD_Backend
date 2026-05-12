const express = require('express');
const router = express.Router();
const verifyJWT = require('../../middleware/verifyJWT');
const { getLeaderboards } = require("../../controllers/user_controllers/leaderboardController");

router.get("/", getLeaderboards);

module.exports = router;
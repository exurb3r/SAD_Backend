const express = require("express");
const router = express.Router();

const { rewardUser, getUsersWithGameDetails } = require("../../controllers/superadmin_controllers/rewardController");

router.get("/", getUsersWithGameDetails);
router.post("/", rewardUser);

module.exports = router;
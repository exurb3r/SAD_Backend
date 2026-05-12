const express = require('express');
const router = express.Router();
const { permit, ROLES } = require('../middleware/role');
const verifyJWT = require('../middleware/verifyJWT');

router.use("/auth", require("./user_routes/auth"));
router.use("/dashboard",require("./user_routes/dashboard"));
router.use("/startworkout",require("./user_routes/startworkout"));
router.use("/gymcalendar",require("./user_routes/gymcalendar"));
router.use("/fitnessnotes",require("./user_routes/usernotes"));
router.use("/progress",require("./user_routes/progress"));
router.use("/community", require("./user_routes/community"));
router.use("/leaderboard", require("./user_routes/leaderboard"))
router.use("/gymhistory", require("./user_routes/gymstatus"));
router.use("/profile", require("./user_routes/profile"));
router.use("/notifications", require("./user_routes/notifications"));


module.exports = router;
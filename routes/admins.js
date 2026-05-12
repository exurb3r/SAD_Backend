const express = require('express');
const router = express.Router();
const { permit, ROLES } = require('../middleware/role');
const verifyJWT = require('../middleware/verifyJWT');

router.use("/auth", require("./admin_routes/adminAuth"));
router.use(verifyJWT);
router.use(permit(ROLES.ADMIN, ROLES.SUPERADMIN));
router.use("/addmembership", require("./admin_routes/addMembership"));
router.use("/appusers", require("./admin_routes/appUsers"));
router.use("/members", require("./admin_routes/members"));
router.use("/communitypost",  require("./admin_routes/communitypost"));
router.use("/logbook", require("./admin_routes/logbook"));
router.use("/events", require("./admin_routes/gymevents"));
router.use("/reward", require("./admin_routes/reward"));
router.use("/enroll-member", require("./admin_routes/addMemberFromUsers"));

module.exports = router;
const express = require('express');
const router = express.Router();
const { permit, ROLES } = require('../middleware/role');
const verifyJWT = require('../middleware/verifyJWT');

router.use("/auth", require("./superadmin_routes/superadminAuth"));
router.use(verifyJWT);
router.use(permit(ROLES.SUPERADMIN));
router.use("/editadmin", require("./superadmin_routes/editadmins"));
router.use("/members", require("./superadmin_routes/members"));
router.use("/logbook", require("./superadmin_routes/logbook"));
router.use("/reward", require("./admin_routes/reward"));
router.use("/communitypost",  require("./admin_routes/communitypost"));


module.exports = router;
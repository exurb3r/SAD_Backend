const express = require("express");
const router = express.Router();
const { getUsersForEnrollment, enrollMember } = require("../../controllers/admin_controllers/addmemberdifferentController");

router.get("/", getUsersForEnrollment);
router.post("/", enrollMember);

module.exports = router;
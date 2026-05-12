const express = require("express")
const router = express.Router()

const { addMember } = require("../../controllers/admin_controllers/addmembership");

router.post("/", addMember)

module.exports = router
const express = require("express")
const router = express.Router()

const {
  getBranchMembers,
  editMember,
  deleteMember
} = require("../../controllers/admin_controllers/membersController")

router.get("/", getBranchMembers)
router.put("/:id", editMember)
router.delete("/:id", deleteMember)

module.exports = router
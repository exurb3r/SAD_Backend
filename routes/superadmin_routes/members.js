const express = require("express")
const router = express.Router()

const {
  getAllMembers,
  editMember,
  deleteMember
} = require("../../controllers/superadmin_controllers/membersController")

router.get("/", getAllMembers)
router.put("/:id", editMember)
router.delete("/:id", deleteMember)

module.exports = router
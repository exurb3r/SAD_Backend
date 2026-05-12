const express = require("express")
const router = express.Router()

const {
  getAppUsers,
  editAppUser,
  toggleAppUserStatus,
  deleteAppUser,
  sendRecoveryEmail
} = require("../../controllers/admin_controllers/appuserController")

router.get("/", getAppUsers)
router.put("/:id", editAppUser)
router.patch("/:id/toggle-status", toggleAppUserStatus)
router.delete("/:id", deleteAppUser)
router.post("/:id/send-recovery", sendRecoveryEmail)

module.exports = router
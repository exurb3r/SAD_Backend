const express = require("express")
const router = express.Router()

const { getLogs, updateLog, deleteLog } = require("../../controllers/superadmin_controllers/logbookController")

router.get("/",        getLogs)
router.put("/:id",     updateLog)
router.delete("/:id",  deleteLog)

module.exports = router
const express = require("express")
const router = express.Router()

const {
  getPosts,
  addPost,
  editPost,
  deletePost
} = require("../../controllers/admin_controllers/communitypostController")

router.get("/",       getPosts)
router.post("/",      addPost)
router.put("/:id",    editPost)
router.delete("/:id", deletePost)

module.exports = router
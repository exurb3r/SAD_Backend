const express = require('express');
const router = express.Router();
const taskHandler = require('../../controllers/user_controllers/notesController');
const verifyJWT = require('../../middleware/verifyJWT');
const { permit, ROLES } = require('../../middleware/role');

router.get('/', verifyJWT, taskHandler.taskFetcher);
router.post('/', verifyJWT, taskHandler.taskAdder);
router.patch('/', verifyJWT, taskHandler.taskEditor);
router.delete('/', verifyJWT, taskHandler.taskDeleter);

module.exports = router;
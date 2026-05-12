const express = require('express');
const router = express.Router();
const taskHandler = require('../../controllers/taskHandler');

router.get('/get', taskHandler.taskFetcher);
router.post('/post', taskHandler.taskAdder);
router.put('/put', taskHandler.taskEditor);
router.delete('/delete', taskHandler.taskDeleter);

module.exports = router;